package com.edc.api.dto;

public record CategoriaResumenMesDTO(
        Long id,
        String nombre,
        String tipo,
        String color,
        String icono,
        Long movimientosMes,
        Double montoTotalDolar
) {}