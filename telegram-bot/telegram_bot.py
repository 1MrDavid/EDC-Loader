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

        # 3. El Prompt "Mágico" que unifica facturas y screenshots
        prompt = """
        Eres un asistente financiero experto. Analiza la imagen adjunta y extrae la información en formato JSON estricto.
        No incluyas markdown ni texto extra, SOLO el JSON.
        
        Estructura requerida:
        {
            "tipo": "PAGO_MOVIL" o "FACTURA",
            "monto": <número decimal (ej. 7466.20 o 4300.00)>,
            "referencia": "<número de comprobante o referencia, ej. 73622173>",
            "fecha": "<fecha visible, preferiblemente YYYY-MM-DD>",
            "banco_origen": "<Banco desde donde se hace el pago si aparece (ej. BFC o Mercantil), de lo contrario null>",
            "banco_o_comercio": "<Para pago móvil: Banco destino. Para factura: Nombre del comercio>",
            "beneficiario": "<Nombre de la persona o comercio destino si aparece, de lo contrario null>",
            "telefono": "<Número de teléfono destino si es pago móvil, de lo contrario null>",
            "identificacion": "<Cédula, RIF o documento destino si es pago móvil, de lo contrario null>",
            "concepto": "<Concepto de la operación si está escrito, de lo contrario null>"
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
            f"🏦 <b>Origen:</b> {datos_extraidos.get('banco_origen', 'N/A')}\n"
            f"🏦 <b>Destino:</b> {datos_extraidos.get('banco_o_comercio', 'N/A')}\n"
            f"👤 <b>Beneficiario:</b> {datos_extraidos.get('beneficiario', 'N/A')}\n"
            f"📱 <b>Teléfono:</b> {datos_extraidos.get('telefono', 'N/A')}\n"
            f"🪪 <b>ID/RIF:</b> {datos_extraidos.get('identificacion', 'N/A')}\n"
            f"📝 <b>Concepto:</b> {datos_extraidos.get('concepto', 'N/A')}\n"
            f"🔢 <b>Ref:</b> <code>{datos_extraidos['referencia']}</code>\n"
            f"📅 <b>Fecha:</b> {datos_extraidos['fecha']}"
        )

        url = "http://python-loader:5000/api/bot-recibo"
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