package com.edc.api.dto;

public record CuentaAhorroDTO(
        Long id,
        String nombre,
        String tipoMoneda,
        Double saldoActual,
        
        Double saldoEquivalenteBs,
        Double saldoEquivalenteUsd,
        
        String color,
        String icono
) {}