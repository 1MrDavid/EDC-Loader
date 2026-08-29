package com.edc.api.dto;

import java.time.LocalDate;

public record MovimientoAhorroDTO(
        Long id,
        Long cuentaAhorroId,
        String tipoOperacion,
        Double monto,
        String descripcion,
        LocalDate fecha,
        Long movimientoId,
        Long registroBotId
) {}
