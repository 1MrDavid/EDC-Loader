package com.edc.api.dto;

import java.time.LocalDate;

public record RegistrarPagoDeudaDTO(
        Long deudaId,
        Long registroBotId,
        Long movimientoId,
        LocalDate fechaPago,
        Double montoPagadoBs,
        Double montoPagadoUsd,
        String origen
) {}
