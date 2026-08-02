package com.edc.api.dto;

public record CategoriaDTO(
        Long id,
        String nombre,
        String tipo,
        String color,
        String icono,
        Boolean activa
) {
}