package com.edc.api.dto;

import java.time.LocalDate;

public record CrearDeudaDTO(
        String nombre,
        String tipoDeuda,
        String frecuencia,
        Double montoBs,
        Double montoUsd,
        Double montoEur,
        Long categoriaId,
        Boolean crearCategoriaDedicada,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String color,
        String icono,
        Integer cuotasTotales
) {}
