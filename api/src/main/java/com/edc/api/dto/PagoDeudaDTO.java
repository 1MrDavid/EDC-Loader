package com.edc.api.dto;

import java.time.LocalDate;

public record PagoDeudaDTO(
        Long id,
        Double montoPagadoBs,
        Double montoPagadoUsd,
        LocalDate fechaPago,
        String deudaNombre,
        String deudaIcono,
        String deudaColor,
        CategoriaResumenDTO categoria,
        Long deudaId,
        Long registroBotId,
        Long movimientoId,
        String origen
) {}
