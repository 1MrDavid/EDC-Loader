package com.edc.api.dto;

public record CategoriaDTO(
        Long id,
        String nombre,
        String tipo,
        Boolean activa
) {
}