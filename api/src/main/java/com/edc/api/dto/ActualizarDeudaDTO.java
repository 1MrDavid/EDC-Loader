package com.edc.api.dto;

import java.time.LocalDate;

public record ActualizarDeudaDTO(
        String nombre,
        String tipoDeuda,
        String frecuencia,
        Double montoBs,
        Double montoUsd,
        Double montoEur,
        Long categoriaId,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String color,
        String icono,
        Integer cuotasTotales,
        Boolean activa
) {}
