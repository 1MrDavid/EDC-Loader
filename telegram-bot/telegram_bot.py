import os
import json
import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import google.generativeai as genai
import PIL.Image

# --- CONFIGURACIÓN ---
# Lo ideal es que estas claves vengan del docker-compose (.env)
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "TELEGRAM_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "GEMINI_API_KEY")

# Configurar logs
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# Configurar IA
genai.configure(api_key=GEMINI_API_KEY)
# Usamos el modelo 'flash' porque es rapidísimo para visión y tiene capa gratuita
model = genai.GenerativeModel('gemini-flash-latest')

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Sistema inicializado! 🚀\nEnvíame capturas de Pago Móvil o fotos de facturas y extraeré los datos."
    )

async def analizar_imagen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    mensaje_espera = await update.message.reply_text("🔍 Analizando imagen...")

    try:
        # 1. Descargar la imagen de Telegram (la de mayor resolución)
        foto = update.message.photo[-1]
        archivo_telegram = await foto.get_file()
        ruta_temporal = f"temp_{update.message.message_id}.jpg"
        await archivo_telegram.download_to_drive(ruta_temporal)

        # 2. Cargar imagen para la IA
        img = PIL.Image.open(ruta_temporal)

        # Capturar el mensaje adjunto a la foto para concepto
        comentario_usuario = update.message.caption or ""

        # 3. El Prompt "Mágico" con Prioridad de Concepto
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

        # 4. Procesar imagen...
        with PIL.Image.open(ruta_temporal) as img:
            response = model.generate_content([prompt, img])
        
        respuesta_texto = response.text.strip()
        if respuesta_texto.startswith("```"):
            respuesta_texto = respuesta_texto.split("\n", 1)[-1].rsplit("\n", 1)[0].strip()

        datos_extraidos = json.loads(respuesta_texto)

        # 5. Formatear el mensaje usando HTML seguro para Telegram
        texto_respuesta = (
            f"✅ <b>{datos_extraidos['tipo']} Procesado</b>\n\n"
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
        respuesta = requests.post(url, json=datos_extraidos)
        respuesta.raise_for_status()
        logging.info(f"Registro guardado en buffer: {respuesta.json()}")

        await mensaje_espera.edit_text(texto_respuesta, parse_mode='HTML')

    except Exception as e:
        logging.error(f"Error procesando imagen: {e}")
        await mensaje_espera.edit_text("❌ Hubo un error procesando la imagen. Asegúrate de que sea legible.")
    
    finally:
        # Limpieza: borrar la imagen temporal para no llenar el contenedor
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