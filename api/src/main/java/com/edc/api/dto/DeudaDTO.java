package com.edc.api.dto;

import java.time.LocalDate;

public record DeudaDTO(
        Long id,
        String nombre,
        String tipoDeuda,
        String frecuencia,
        Double montoBs,
        Double montoUsd,
        Double montoEur,
        
        Double montoEquivalenteBs,
        Double montoEquivalenteUsd,
        Boolean pagadoEstePeriodo, 
        
        CategoriaResumenDTO categoria,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Boolean activa,
        String color,
        String icono,

        Integer cuotasTotales,
        Integer cuotasPagadas,
        Double montoAbonadoBs,
        Double montoAbonadoUsd
) {}