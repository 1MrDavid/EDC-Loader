package com.edc.api.dto;

public record ReglaDTO(
        Long id,
        String patron,
        String tipoPatron,
        Long categoriaId,
        Boolean activa
) {
}