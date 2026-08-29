package com.edc.api.dto;

public record LimiteCategoriaDTO(
        Long id,
        Long categoriaId,
        String categoriaNombre,
        String categoriaColor,
        String categoriaIcono,
        Double limiteUsd,
        Double gastadoUsd,
        Double porcentajeConsumo,
        String estado,
        Integer mes,
        Integer ano,
        Boolean global
) {}
