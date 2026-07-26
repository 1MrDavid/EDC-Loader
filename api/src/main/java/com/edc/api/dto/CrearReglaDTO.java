package com.edc.api.dto;

public record CrearReglaDTO(
        String patron,
        String tipoPatron, // "DESCRIPCION", "TELEFONO", "CUENTA"
        Long categoriaId
) {
}