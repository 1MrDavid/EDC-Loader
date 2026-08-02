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
        
        REGLAS IMPORTANTES:
        - Para RECIBOS DE PUNTO DE VENTA (Facturas):
          1. El número de referencia DEBE ser el que dice "TRACE" (ej. 007760). Solo si no existe TRACE, usa el que dice "REF" o "RECIBO".
          2. El "banco_o_comercio" debe ser el Banco dueño del punto de venta (el que sale en el encabezado, ej. BANCO DE VENEZUELA, BNC, etc).
          3. El "beneficiario" debe ser el nombre real del local/comercio (ej. INVERSIONES VENEGAS 19 12).
          
        - Para PAGOS MÓVILES:
          1. Sigue las reglas normales de extracción.
          
        - REGLA PARA EL CONCEPTO:
          1. Si el "COMENTARIO DEL USUARIO" tiene texto, úsalo EXACTAMENTE como concepto.
          2. Si el "COMENTARIO DEL USUARIO" está vacío, extrae el "Concepto", "Motivo" o "Detalle" que aparezca escrito en la imagen.
          3. Solo si no hay comentario tuyo ni concepto en la imagen, asigna null.
        
        Estructura requerida:
        {
            "tipo": "PAGO_MOVIL" o "FACTURA",
            "monto": <número decimal (ej. 7466.20 o 9302.88)>,
            "referencia": "<Número de TRACE si es factura. Si no, usa el comprobante/REF>",
            "fecha": "<fecha visible, preferiblemente YYYY-MM-DD>",
            "banco_origen": "<Banco desde donde se paga si aparece, de lo contrario null>",
            "banco_o_comercio": "<Banco destino (Pago Móvil) o Banco del Punto de Venta (Factura)>",
            "beneficiario": "<Nombre de la persona o nombre del local/comercio>",
            "telefono": "<Número de teléfono si es pago móvil, de lo contrario null>",
            "identificacion": "<Cédula o RIF destino (ej. J500471122)>",
            "concepto": "<Prioridad 1: Comentario del usuario. Prioridad 2: Concepto en la imagen. Prioridad 3: null>"
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