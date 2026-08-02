# Usamos una imagen ligera oficial de Python
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y fuerza los logs a consola en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos primero las dependencias para aprovechar el caché de Docker
COPY requirements.txt /app/

# Instalamos las librerías necesarias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . /app/

# Ejecutamos el bot
CMD ["python", "telegram_bot.py"]