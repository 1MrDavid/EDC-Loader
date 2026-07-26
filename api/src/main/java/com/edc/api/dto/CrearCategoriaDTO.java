package com.edc.api.dto;

public record CrearCategoriaDTO(
        String nombre,
        String tipo // Debe ser "INGRESO" o "EGRESO"
) {
}