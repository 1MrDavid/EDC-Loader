# python-checker.py

Este script se ejecuta en bucle como un servicio (daemon). Realiza comprobaciones periódicas y decide si ejecutar el script `python-loader.py`.

## Funciones principales

### `db_disponible()`
Intenta conectarse a la base de datos PostgreSQL para verificar si está activa. Devuelve `True` si está disponible o `False` en caso de error.

### `archivos_nuevos()`
- Lista los archivos presentes en la carpeta `./estados-cuenta`.
- Consulta la tabla `archivos_cargados` para verificar si ya fueron procesados.
- Devuelve una lista con los archivos aún no cargados.

### `carga_precio_dolar()`
- Consulta si ya se cargó el valor del dólar del día anterior en la tabla `valor_dolar`.
- Si no existe, realiza una solicitud HTTP a la API pública de Dólar BCV (`https://ve.dolarapi.com/v1/dolares/oficial`) y lo guarda en la base de datos.

> **Nota:** El sistema carga el valor del dólar correspondiente al día anterior, ya que la ejecución del demonio suele ocurrir en la madrugada, mientras que el BCV publica el valor actualizado generalmente después de las 4:00 p. m. Esto garantiza que el precio del día anterior ya esté disponible y actualizado en la API al momento de la consulta.

### `ejecutar_loader()`
Llama al script `python-loader.py` usando `subprocess.run`. Esto se realiza solo si se detectan archivos nuevos.

### `main()`
- Ejecuta el bucle principal del checker.
- Cada ciclo:
  1. Verifica si la base de datos está activa.
  2. Carga el valor del dólar anterior si aún no ha sido registrado.
  3. Comprueba si hay archivos nuevos por cargar.
  4. Si los hay, ejecuta el loader.
  5. Espera `CHEQUEO_INTERVALO` segundos antes de repetir el ciclo.

## Consideraciones
- El intervalo de tiempo se puede configurar con una constante.
- Los logs indican claramente cada paso que se realiza.

---

© 2025 - Proyecto EDC