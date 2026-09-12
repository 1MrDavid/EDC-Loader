package com.edc.api.dto;

import java.time.LocalDate;

public record CrearRegistroBotDTO(
        String tipo,
        Double monto,
        Boolean esIngreso,
        String referencia,
        LocalDate fecha,
        String bancoOrigen,
        String bancoDestino,
        String beneficiario,
        String telefono,
        String identificacion,
        String concepto
) {}
