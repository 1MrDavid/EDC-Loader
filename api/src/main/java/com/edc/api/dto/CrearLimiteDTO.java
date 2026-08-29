package com.edc.api.dto;

public record CrearLimiteDTO(
        Long categoriaId,
        Double montoUsd,
        Integer mes,
        Integer ano
) {}
