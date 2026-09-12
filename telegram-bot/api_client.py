import logging
import os

import requests

EDC_API_BASE_URL = os.environ.get("EDC_API_BASE_URL", "http://spring-api:8080/api/v1")
TIMEOUT_SECONDS = 15


class EdcApiError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _url(path: str) -> str:
    return f"{EDC_API_BASE_URL.rstrip('/')}/{path.lstrip('/')}"


def _mensaje_error(respuesta: requests.Response) -> str:
    try:
        body = respuesta.json()
        if isinstance(body, dict) and body.get("message"):
            return body["message"]
    except ValueError:
        pass
    return f"Error HTTP {respuesta.status_code} al contactar la API"


def _request(method: str, path: str, json: dict | None = None):
    try:
        respuesta = requests.request(
            method,
            _url(path),
            json=json,
            timeout=TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        logging.error("Fallo de red contra EDC API (%s %s): %s", method, path, exc)
        raise EdcApiError("No se pudo conectar con la API de deudas.") from exc

    if not respuesta.ok:
        raise EdcApiError(_mensaje_error(respuesta), respuesta.status_code)

    if respuesta.status_code == 204 or not respuesta.content:
        return None
    return respuesta.json()


def obtener_categorias() -> list[dict]:
    data = _request("GET", "/categorias") or []
    return [c for c in data if c.get("tipo") == "EGRESO" and c.get("activa") is not False]


def crear_categoria(nombre: str, color: str = "#64748b", icono: str = "🛍️") -> dict:
    return _request(
        "POST",
        "/categorias",
        json={
            "nombre": nombre,
            "tipo": "EGRESO",
            "color": color,
            "icono": icono,
        },
    )


def crear_deuda(dto: dict) -> dict:
    return _request("POST", "/deudas", json=dto)
