import os
import json
import logging
import requests
import time
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, MessageHandler, filters, ContextTypes
import google.generativeai as genai
import PIL.Image
import asyncio
from telegram.error import TimedOut, NetworkError

# Importamos InvalidArgument para atrapar el error 400 (imágenes no soportadas)
from google.api_core.exceptions import ResourceExhausted, NotFound, DeadlineExceeded, InternalServerError, InvalidArgument
from api_client import EdcApiError, crear_categoria, crear_deuda, obtener_categorias

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

CASHEA_STATE_KEYS = ("cashea_pendiente", "cashea_esperando_nombre_cat", "categorias_egreso")
CASHEA_COLOR = "#64748b"
CASHEA_ICONO = "🛍️"


def limpiar_estado_cashea(context: ContextTypes.DEFAULT_TYPE) -> None:
    for key in CASHEA_STATE_KEYS:
        context.user_data.pop(key, None)


def construir_dto_deuda_cashea(datos: dict, *, crear_dedicada: bool = False, categoria_id: int | None = None) -> dict:
    return {
        "nombre": datos["nombre"],
        "tipoDeuda": "DEFINIDA",
        "frecuencia": datos.get("frecuencia") or "QUINCENAL",
        "montoUsd": datos["montoUsd"],
        "montoBs": None,
        "montoEur": None,
        "fechaInicio": datos["fechaInicio"],
        "fechaFin": None,
        "cuotasTotales": datos.get("cuotasTotales"),
        "color": CASHEA_COLOR,
        "icono": CASHEA_ICONO,
        "crearCategoriaDedicada": crear_dedicada,
        "categoriaId": categoria_id,
    }


def construir_teclado_cashea(categorias: list[dict]) -> InlineKeyboardMarkup:
    filas: list[list[InlineKeyboardButton]] = [
        [InlineKeyboardButton("⭐ Crear categoría dedicada (recomendado)", callback_data="cashea:dedica")]
    ]

    fila_categorias: list[InlineKeyboardButton] = []
    for cat in categorias:
        etiqueta = f"{cat.get('icono') or '🏷️'} {cat.get('nombre')}"
        if len(etiqueta) > 28:
            etiqueta = etiqueta[:27] + "…"
        fila_categorias.append(
            InlineKeyboardButton(etiqueta, callback_data=f"cashea:cat:{cat['id']}")
        )
        if len(fila_categorias) == 2:
            filas.append(fila_categorias)
            fila_categorias = []
    if fila_categorias:
        filas.append(fila_categorias)

    filas.append([InlineKeyboardButton("➕ Crear otra categoría", callback_data="cashea:nueva")])
    filas.append([InlineKeyboardButton("❌ Cancelar", callback_data="cashea:cancel")])
    return InlineKeyboardMarkup(filas)


def texto_resumen_cashea(datos: dict) -> str:
    return (
        "🛍️ <b>Deuda Cashea Detectada</b>\n\n"
        f"🏬 <b>Tienda:</b> {datos['nombre']}\n"
        f"💰 <b>Deuda Total:</b> ${datos['montoUsd']}\n"
        f"🔢 <b>Cuotas:</b> {datos['cuotasTotales']} pagos\n"
        f"📅 <b>Primer Pago:</b> {datos['fechaInicio']}\n\n"
        "Elige una categoría de egreso. La opción dedicada está recomendada."
    )


def texto_confirmacion_deuda(deuda: dict) -> str:
    categoria = deuda.get("categoria") or {}
    nombre_cat = categoria.get("nombre") or "N/A"
    icono_cat = categoria.get("icono") or ""
    return (
        "✅ <b>Deuda Cashea registrada</b>\n\n"
        f"🏬 <b>Tienda:</b> {deuda.get('nombre')}\n"
        f"💰 <b>Monto:</b> ${deuda.get('montoUsd')}\n"
        f"🔢 <b>Cuotas:</b> {deuda.get('cuotasTotales')}\n"
        f"📅 <b>Primer pago:</b> {deuda.get('fechaInicio')}\n"
        f"🏷️ <b>Categoría:</b> {icono_cat} {nombre_cat}"
    )


async def persistir_deuda_cashea(query_or_update, context: ContextTypes.DEFAULT_TYPE, dto: dict) -> None:
    try:
        deuda = crear_deuda(dto)
        limpiar_estado_cashea(context)
        texto = texto_confirmacion_deuda(deuda)
        if hasattr(query_or_update, "edit_message_text"):
            await query_or_update.edit_message_text(texto, parse_mode="HTML")
        else:
            await query_or_update.message.reply_text(texto, parse_mode="HTML")
    except EdcApiError as exc:
        logging.error("Error creando deuda Cashea: %s", exc)
        mensaje = f"❌ No se pudo crear la deuda: {exc.message}"
        if hasattr(query_or_update, "edit_message_text"):
            await query_or_update.edit_message_text(mensaje)
        else:
            await query_or_update.message.reply_text(mensaje)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Sistema inicializado! 🚀\nEnvíame capturas de Pago Móvil o fotos de facturas y extraeré los datos."
    )

async def analizar_imagen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    limpiar_estado_cashea(context)
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

        REGLA ESTRICTA DE FECHAS (LOCALIZACIÓN VENEZUELA):
            Los recibos y comprobantes utilizan el formato de fecha Europeo/Latinoamericano: DD/MM/YYYY (Día/Mes/Año).
            Bajo ninguna circunstancia asumas el formato de Estados Unidos.
            Ejemplo: "02/09/2026" significa 2 de Septiembre, NUNCA 9 de Febrero.
            Debes extraer esta fecha y devolverla siempre en formato estándar ISO: "YYYY-MM-DD".
        
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

#======================================================================================================================
# FLUJO DE DEUDAS DE CASHEA
#======================================================================================================================
async def analizar_cashea(update: Update, context: ContextTypes.DEFAULT_TYPE):
    limpiar_estado_cashea(context)
    mensaje_espera = await update.message.reply_text("🛍️ Analizando plan de Cashea...", read_timeout=15)
    ruta_temporal = f"temp_cashea_{update.message.message_id}.jpg"

    try:
        foto = update.message.photo[-1]
        archivo_telegram = await foto.get_file(read_timeout=20)
        await archivo_telegram.download_to_drive(ruta_temporal)

        prompt_cashea = """
        Eres un asistente financiero experto. El usuario ha subido una captura de pantalla de su plan de pagos de la app "Cashea".
        Tu objetivo es extraer los datos para registrar una nueva deuda en el sistema.
        
        INSTRUCCIONES DE EXTRACCIÓN:
        1. "nombre": Extrae el nombre de la tienda (ej. si dice "Orden en Tiendas Daka", el nombre es "Cashea - Tiendas Daka").
        2. "monto_usd": Extrae el monto total RESTANTE a pagar (suele decir "$X para terminar de pagar tu compra"). NO incluyas el pago inicial, solo la deuda.
        3. "cuotas_totales": El número de cuotas restantes (suele ser 3).
        4. "fecha_inicio": La fecha de la PRIMERA cuota pendiente (ej. "21 de Sept"). Conviértela a formato "YYYY-MM-DD". Asume el año actual o el próximo si el mes es menor al actual.
        5. "frecuencia": Cashea siempre se paga cada 14 días. Devuelve estrictamente "QUINCENAL".
        
        Devuelve SOLO un JSON estricto con esta estructura:
        {
            "nombre": "<Nombre de la tienda>",
            "tipoDeuda": "DEFINIDA",
            "frecuencia": "QUINCENAL",
            "montoUsd": <decimal>,
            "cuotasTotales": <entero>,
            "fechaInicio": "<YYYY-MM-DD>"
        }
        """

        modelos_a_probar = obtener_lista_limpia()
        respuesta_texto = None

        with PIL.Image.open(ruta_temporal) as img:
            for nombre_modelo in modelos_a_probar:
                try:
                    model = genai.GenerativeModel(nombre_modelo)
                    response = model.generate_content([prompt_cashea, img], request_options={"timeout": 60})
                    respuesta_texto = response.text.strip()
                    break
                except Exception as e:
                    logging.warning(f"Fallo con {nombre_modelo} en Cashea: {e}")
                    continue

        if not respuesta_texto:
            await mensaje_espera.edit_text("❌ No se pudo procesar la imagen de Cashea.")
            return

        if respuesta_texto.startswith("```"):
            respuesta_texto = respuesta_texto.split("\n", 1)[-1].rsplit("\n", 1)[0].strip()

        datos_deuda = json.loads(respuesta_texto)
        categorias = obtener_categorias()

        context.user_data["cashea_pendiente"] = datos_deuda
        context.user_data["categorias_egreso"] = categorias

        await mensaje_espera.edit_text(
            texto_resumen_cashea(datos_deuda),
            parse_mode="HTML",
            reply_markup=construir_teclado_cashea(categorias),
        )

    except EdcApiError as e:
        logging.error(f"Error consultando categorías para Cashea: {e}")
        limpiar_estado_cashea(context)
        await mensaje_espera.edit_text(f"❌ No se pudieron cargar las categorías: {e.message}")
    except Exception as e:
        logging.error(f"Error procesando Cashea: {e}")
        limpiar_estado_cashea(context)
        await mensaje_espera.edit_text("❌ Error al leer la imagen de Cashea.")
    finally:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)


async def manejar_callback_cashea(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    accion = query.data or ""
    datos = context.user_data.get("cashea_pendiente")

    if accion == "cashea:cancel":
        limpiar_estado_cashea(context)
        await query.edit_message_text("❌ Registro de Cashea cancelado.")
        return

    if not datos:
        await query.edit_message_text("⚠️ No hay un plan de Cashea pendiente. Envía de nuevo la captura con /cashea.")
        return

    if accion == "cashea:dedica":
        dto = construir_dto_deuda_cashea(datos, crear_dedicada=True)
        await persistir_deuda_cashea(query, context, dto)
        return

    if accion == "cashea:nueva":
        context.user_data["cashea_esperando_nombre_cat"] = True
        await query.edit_message_text(
            "✏️ Escribe el nombre de la nueva categoría de egreso.\n"
            "Se usará para esta deuda de Cashea."
        )
        return

    if accion.startswith("cashea:cat:"):
        categoria_id = int(accion.split(":")[-1])
        dto = construir_dto_deuda_cashea(datos, categoria_id=categoria_id)
        await persistir_deuda_cashea(query, context, dto)


async def manejar_nombre_categoria_cashea(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("cashea_esperando_nombre_cat"):
        return

    datos = context.user_data.get("cashea_pendiente")
    nombre = (update.message.text or "").strip()
    if not datos:
        limpiar_estado_cashea(context)
        await update.message.reply_text("⚠️ No hay un plan de Cashea pendiente. Envía de nuevo la captura con /cashea.")
        return

    if not nombre:
        await update.message.reply_text("Escribe un nombre válido para la categoría.")
        return

    try:
        categoria = crear_categoria(nombre, color=CASHEA_COLOR, icono=CASHEA_ICONO)
        dto = construir_dto_deuda_cashea(datos, categoria_id=categoria["id"])
        await persistir_deuda_cashea(update, context, dto)
    except EdcApiError as exc:
        logging.error("Error creando categoría Cashea: %s", exc)
        await update.message.reply_text(f"❌ No se pudo crear la categoría: {exc.message}")


def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(manejar_callback_cashea, pattern=r"^cashea:"))
    
    # 1. Filtro específico: Si la imagen viene con el texto "/cashea" en la descripción
    app.add_handler(MessageHandler(filters.PHOTO & filters.CaptionRegex(r'(?i)^/cashea'), analizar_cashea))
    
    # 2. Filtro general: Si es una imagen normal (sin el comando /cashea)
    app.add_handler(MessageHandler(filters.PHOTO & ~filters.CaptionRegex(r'(?i)^/cashea'), analizar_imagen))

    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, manejar_nombre_categoria_cashea))
    
    logging.info("Bot de finanzas iniciado y escuchando...")
    app.run_polling()

if __name__ == '__main__':
    main()