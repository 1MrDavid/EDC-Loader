import os
import json
import logging
import requests
import time
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import google.generativeai as genai
import PIL.Image
import asyncio
from telegram.error import TimedOut, NetworkError

# Importamos InvalidArgument para atrapar el error 400 (imágenes no soportadas)
from google.api_core.exceptions import ResourceExhausted, NotFound, DeadlineExceeded, InternalServerError, InvalidArgument

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "TELEGRAM_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "GEMINI_API_KEY")

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

genai.configure(api_key=GEMINI_API_KEY)

def obtener_modelos_dinamicos():
    modelos_validos = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods and 'gemini' in m.name.lower():
                modelos_validos.append(m.name)
        modelos_validos.sort(key=lambda x: (0 if 'flash' in x.lower() else 1, x))
        logging.info(f"Modelos cargados dinámicamente: {modelos_validos}")
        return modelos_validos
    except Exception as e:
        logging.error(f"Error cargando modelos: {e}")
        return ['models/gemini-1.5-flash', 'models/gemini-1.5-pro']

MODELOS_DISPONIBLES = obtener_modelos_dinamicos()

modelos_bloqueados = {}
TIEMPO_CASTIGO = 86400 # 24 horas en segundos

def obtener_lista_limpia():
    ahora = time.time()
    # Mantiene los modelos que NO están bloqueados, o cuyo castigo ya expiró
    lista_limpia = [m for m in MODELOS_DISPONIBLES if m not in modelos_bloqueados or modelos_bloqueados[m] < ahora]
    
    # Si todos los modelos están bloqueados, perdonamos a todos y reseteamos la caché
    if not lista_limpia:
        logging.warning("⚠️ Todos los modelos estaban en lista negra. Limpiando caché para reintentar.")
        modelos_bloqueados.clear()
        return MODELOS_DISPONIBLES
        
    return lista_limpia

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Sistema inicializado! 🚀\nEnvíame capturas de Pago Móvil o fotos de facturas y extraeré los datos."
    )

async def analizar_imagen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    mensaje_espera = None
    for intento in range(3):
        try:
            # Le damos 15 segundos de paciencia para conectar y enviar el primer mensaje
            mensaje_espera = await update.message.reply_text(
                "🔍 Analizando imagen...", 
                read_timeout=15, 
                connect_timeout=15
            )
            break # Si funciona, salimos del bucle
        except (TimedOut, NetworkError) as e:
            logging.warning(f"Intento {intento+1} de responder falló por red: {e}. Reintentando...")
            await asyncio.sleep(2)
    
    if not mensaje_espera:
        logging.error("Imposible contactar con Telegram para iniciar el análisis. Abortando.")
        return

    ruta_temporal = f"temp_{update.message.message_id}.jpg"

    try:
        foto = update.message.photo[-1]

        for intento in range(3):
            try:
                archivo_telegram = await foto.get_file(read_timeout=20, connect_timeout=15)
                await archivo_telegram.download_to_drive(ruta_temporal)
                break
            except (TimedOut, NetworkError) as e:
                logging.warning(f"Intento {intento+1} de descargar foto falló: {e}. Reintentando...")
                await asyncio.sleep(2)

        if not os.path.exists(ruta_temporal):
            await mensaje_espera.edit_text("❌ No se pudo descargar la imagen de los servidores de Telegram por problemas de red.")
            return

        comentario_usuario = update.message.caption or ""

        prompt = f'COMENTARIO DEL USUARIO AL ENVIAR LA FOTO: "{comentario_usuario}"\n\n' + """
        Eres un asistente financiero experto. Analiza la imagen adjunta y extrae la información en formato JSON estricto.
        No incluyas markdown ni texto extra, SOLO el JSON.
        
        TIPOS DE OPERACIÓN PERMITIDOS:
        - "PAGO_MOVIL": Envío de dinero por teléfono.
        - "FACTURA": Recibo impreso de punto de venta físico.
        - "TRANSFERENCIA": Envío a una cuenta bancaria (20 dígitos).
        - "PAGO_SERVICIO": Pagos a SimpleTV, Corpoelec, Inter, telefonía, etc.
        - "DEBITO_INMEDIATO": Pagos a través de pasarelas virtuales (Sypago, Netuno, etc).
        
        REGLAS DE EXTRACCIÓN POR TIPO:
        1. FACTURA (Punto de Venta):
           - "banco_destino" = Banco dueño del punto de venta (ej. BNC, Mercantil). NUNCA el nombre del local.
           - "beneficiario" = Nombre del local o empresa (ej. INVERSIONES VENEGAS).
           - "referencia" = Número "TRACE" (prioridad absoluta). Si no hay, usa "REF".
        2. TRANSFERENCIA:
           - Extrae "banco_origen" y "banco_destino". "telefono" debe ser null.
        3. PAGO_SERVICIO y DEBITO_INMEDIATO:
           - "beneficiario" = La empresa del servicio prestado (ej. Simple, Netuno).
           - "banco_origen" = Banco desde donde se pagó.
           - REGLA DE REFERENCIA: Si hay múltiples referencias (ej. Ref Sypago y Ref Banco), extrae SIEMPRE la "Ref Banco" o "Referencia del Banco" (suele ser numérica).
           
        REGLA GLOBAL PARA EL CONCEPTO:
        - Prioridad 1: "COMENTARIO DEL USUARIO". Si tiene texto, úsalo EXACTAMENTE.
        - Prioridad 2: Concepto, Motivo o Detalle escrito en la imagen.
        - Prioridad 3: null.

        REGLA GLOBAL DE FECHAS:
        - Las fechas en los comprobantes venezolanos están en formato Día/Mes/Año (DD/MM/YYYY). Por ejemplo, 8/3/2026 significa 3 de Agosto, NO 8 de Marzo. Devuelve siempre el formato final como YYYY-MM-DD.
        
        Estructura requerida:
        {
            "tipo": "<UNO DE LOS TIPOS PERMITIDOS ARRIBA>",
            "monto": <decimal (ej. 7466.20)>,
            "es_ingreso": <booleano. false si es un pago/egreso, true si recibiste dinero>,
            "referencia": "<Número de referencia o TRACE>",
            "fecha": "<YYYY-MM-DD>",
            "banco_origen": "<Banco pagador si aparece, null si no>",
            "banco_destino": "<Banco receptor o Banco del Punto de Venta (NUNCA el comercio)>",
            "beneficiario": "<Nombre de la persona, comercio local o empresa de servicio>",
            "telefono": "<Teléfono destino si aplica, null si no>",
            "identificacion": "<Cédula o RIF destino, null si no>",
            "concepto": "<Prioridad 1: Comentario. Prioridad 2: Imagen. Prioridad 3: null>"
        }
        """

        respuesta_texto = None
        modelo_exitoso = ""
        
        # Obtenemos la lista ignorando los bloqueados
        modelos_a_probar = obtener_lista_limpia()

        with PIL.Image.open(ruta_temporal) as img:
            for nombre_modelo in modelos_a_probar:
                try:
                    logging.info(f"Intentando extraer datos con: {nombre_modelo}")
                    model = genai.GenerativeModel(nombre_modelo)
                    
                    response = model.generate_content(
                        [prompt, img],
                        request_options={"timeout": 60}
                    )
                    
                    respuesta_texto = response.text.strip()
                    modelo_exitoso = nombre_modelo
                    break
                    
                except ResourceExhausted:
                    logging.warning(f"Límite de cuota (429) en {nombre_modelo}. Bloqueando por 24h...")
                    modelos_bloqueados[nombre_modelo] = time.time() + TIEMPO_CASTIGO
                    continue
                except NotFound:
                    logging.warning(f"Modelo deprecado (404) en {nombre_modelo}. Bloqueando por 24h...")
                    modelos_bloqueados[nombre_modelo] = time.time() + TIEMPO_CASTIGO
                    continue
                except InvalidArgument as e:
                    # Este atrapa el error 400: "Image input modality is not enabled"
                    logging.warning(f"Incompatible con imágenes (400) en {nombre_modelo}. Bloqueando por 24h...")
                    modelos_bloqueados[nombre_modelo] = time.time() + TIEMPO_CASTIGO
                    continue
                except (DeadlineExceeded, InternalServerError):
                    # Errores de red (504/500). NO los bloqueamos por 24h, solo los saltamos por este intento
                    logging.warning(f"Servidor inestable (504/500) en {nombre_modelo}. Saltando...")
                    continue
                except Exception as e:
                    # Fallback general para otros errores 400 extraños de modalidad
                    if "400" in str(e) or "Image input" in str(e):
                        modelos_bloqueados[nombre_modelo] = time.time() + TIEMPO_CASTIGO
                    logging.error(f"Fallo inesperado con {nombre_modelo}: {e}. Saltando...")
                    continue

        if not respuesta_texto:
            await mensaje_espera.edit_text("❌ Todos los modelos disponibles fallaron, están saturados o sin cuota.")
            return

        if respuesta_texto.startswith("```"):
            respuesta_texto = respuesta_texto.split("\n", 1)[-1].rsplit("\n", 1)[0].strip()

        datos_extraidos = json.loads(respuesta_texto)

        texto_respuesta = (
            f"✅ <b>{datos_extraidos['tipo']} Procesado</b>\n"
            f"🤖 <i>Modelo: {modelo_exitoso.replace('models/', '')}</i>\n\n"
            f"💰 <b>Monto:</b> Bs. {datos_extraidos['monto']}\n"
            f"🏦 <b>Origen:</b> {datos_extraidos.get('banco_origen') or 'N/A'}\n"
            f"🏦 <b>Destino:</b> {datos_extraidos.get('banco_destino') or 'N/A'}\n"
            f"👤 <b>Contraparte:</b> {datos_extraidos.get('beneficiario') or 'N/A'}\n"
            f"📱 <b>Teléfono:</b> {datos_extraidos.get('telefono') or 'N/A'}\n"
            f"🪪 <b>ID/RIF:</b> {datos_extraidos.get('identificacion') or 'N/A'}\n"
            f"📝 <b>Concepto:</b> {datos_extraidos.get('concepto') or 'N/A'}\n"
            f"🔢 <b>Ref:</b> <code>{datos_extraidos['referencia']}</code>\n"
            f"📅 <b>Fecha:</b> {datos_extraidos['fecha']}"
        )

        url = "http://edc-python-loader:5000/api/bot-recibo"
        respuesta = requests.post(url, json=datos_extraidos, timeout=10)
        respuesta.raise_for_status()
        logging.info(f"Registro guardado en buffer.")

        # --- PROTECCIÓN CONTRA TIMEOUTS DE TELEGRAM ---
        try:
            # Le damos 20 segundos explícitos a Telegram para responder
            await mensaje_espera.edit_text(
                texto_respuesta, 
                parse_mode='HTML', 
                read_timeout=20, 
                write_timeout=20
            )
        except (TimedOut, NetworkError):
            logging.warning("Telegram tardó en responder, pero el mensaje probablemente se envió. Reintentando...")
            await asyncio.sleep(1)
            try:
                await mensaje_espera.edit_text(texto_respuesta, parse_mode='HTML', read_timeout=20)
            except Exception:
                pass
                
    except Exception as e:
        logging.error(f"Error procesando imagen: {e}")
        try:
            await mensaje_espera.edit_text("❌ Hubo un error procesando la imagen. Asegúrate de que sea legible.", read_timeout=15)
        except:
            pass
    
    finally:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO, analizar_imagen))
    logging.info("Bot de finanzas iniciado y escuchando...")
    app.run_polling()

if __name__ == '__main__':
    main()