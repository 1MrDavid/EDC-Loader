# Documentación técnica: python-loader.py

Este script es ejecutado por el `checker` cuando se detectan archivos nuevos por cargar.

## Funciones clave

### `convertir_valor(val)`
Convierte valores con comas (`,`) a formato decimal válido (`float`) con puntos (`.`), adaptado para ser insertado en PostgreSQL.

### `convertir_fecha(valor)`
Convierte fechas en formato `dd/mm/yyyy` a tipo `date` (`yyyy-mm-dd`).

### `archivo_ya_cargado(cursor, nombre_archivo)`
Verifica si el archivo ya fue procesado, consultando la tabla `archivos_cargados`.

### `registrar_archivo_cargado(cursor, nombre_archivo)`
Registra el nombre del archivo en la tabla `archivos_cargados` para evitar duplicados.

### `consultaDolar(fecha, cursor)`
Consulta el precio del dólar en la tabla `valor_dolar` para una fecha dada (`yyyymmdd`).

### `procesar_archivo(ruta_archivo, cursor)`
Abre el archivo `.txt` línea por línea, procesa cada transacción y la inserta en la tabla `finanzas`. Realiza conversiones a tipo `float`, `date` y calcula valores en dólares.

- Campos procesados por línea:
  - `fecha_valor`
  - `fecha_efectiva`
  - `referencia`
  - `descripcion`
  - `egreso`, `ingreso`, `saldo`
  - `egresoDolar`, `ingresoDolar`, `saldoDolar`
  - `tasaDolar` del día de la transacción

### `main()`
- Verifica existencia de la carpeta `./estados-cuenta`.
- Recorre todos los archivos `.txt`:
  - Si ya fue cargado → se omite
  - Si es nuevo → se procesa e inserta
  - Se registra como archivo cargado

## Consideraciones
- Se usa `Decimal` para cálculos en dólares, minimizando errores de precisión.
- La conexión a la base de datos debe estar abierta durante todo el procesamiento.
- Los archivos `.txt` deben tener un encabezado que se ignora con `next(archivo)`.

---

© 2025 - Proyecto EDC