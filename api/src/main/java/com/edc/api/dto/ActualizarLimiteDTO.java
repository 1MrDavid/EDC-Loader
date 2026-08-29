package com.edc.api.dto;

public record ActualizarLimiteDTO(
        Long categoriaId,
        Double montoUsd,
        Integer mes,
        Integer ano,
        Boolean activa
) {}
