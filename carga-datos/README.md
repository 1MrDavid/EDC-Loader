# carga-datos

Sistema automatizado para la carga de datos financieros desde archivos `.txt` a una base de datos PostgreSQL.

## Descripción general

El proyecto está compuesto por dos scripts principales:

- `python-checker.py`: Se ejecuta como un daemon que monitorea la disponibilidad de la base de datos, verifica si ya se ha cargado el precio oficial del dólar y si hay archivos nuevos por procesar. En caso afirmativo, ejecuta el script de carga.
- `python-loader.py`: Procesa los archivos `.txt` de estados de cuenta y registra los datos en la base de datos, junto con el valor del dólar correspondiente a la fecha de cada transacción.

## Estructura del sistema

```
./carga-datos
├── python-checker.py      # Monitoreo y lógica de ejecución
├── python-loader.py       # Procesamiento y carga de datos
├── estados-cuenta/        # Carpeta donde se colocan los .txt a cargar
├── docs/
│   ├── checker.md         # Documentación técnica del checker
│   └── loader.md          # Documentación técnica del loader
```

## Ejecución

Coloca los archivos `.txt` en la carpeta `./estados-cuenta/` y ejecuta el checker:

```bash
python python-checker.py
```

Este script se ejecutará periódicamente, verificando si hay archivos nuevos para cargar y si es necesario insertar el valor del dólar del día.

## Requisitos

- Python 3.8+
- PostgreSQL
- Librerías:
  - `psycopg2`
  - `requests`

## Documentación técnica

Para detalles de implementación interna:

- [Detalles de `python-checker.py`](docs/checker.md)
- [Detalles de `python-loader.py`](docs/loader.md)

---

© 2025 - Proyecto EDC