package com.edc.api.dto;

public record ValorDolarDTO(
        int fecha,
        int dia,
        int mes,
        int ano,
        double precio
) {
}
