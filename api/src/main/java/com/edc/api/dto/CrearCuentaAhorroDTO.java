package com.edc.api.dto;

public record CrearCuentaAhorroDTO(
        String nombre,
        String tipoMoneda,
        Double saldoInicial,
        String color,
        String icono
) {}
