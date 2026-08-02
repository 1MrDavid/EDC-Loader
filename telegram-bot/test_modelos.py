import os
import google.generativeai as genai

# Pon tu API Key aquí directamente solo para esta prueba
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

print("Modelos disponibles con soporte para generar contenido:")
print("-" * 50)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)