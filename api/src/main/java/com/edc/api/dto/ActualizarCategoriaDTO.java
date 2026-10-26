package com.edc.api.dto;

public record ActualizarCategoriaDTO(
        String nombre,
        String tipo,
        String color,
        String icono
) {
    public ActualizarCategoriaDTO {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        if (tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("El tipo de la categoría es obligatorio");
        }
        String tipoNormalizado = tipo.trim().toUpperCase();
        if (!tipoNormalizado.equals("INGRESO") && !tipoNormalizado.equals("EGRESO")) {
            throw new IllegalArgumentException("El tipo debe ser INGRESO o EGRESO");
        }
        if (color == null || color.isBlank()) {
            throw new IllegalArgumentException("El color es obligatorio");
        }
        if (icono == null || icono.isBlank()) {
            throw new IllegalArgumentException("El icono es obligatorio");
        }
        nombre = nombre.trim();
        tipo = tipoNormalizado;
        color = color.trim();
        icono = icono.trim();
    }
}
