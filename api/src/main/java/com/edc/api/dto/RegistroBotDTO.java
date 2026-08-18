package com.edc.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RegistroBotDTO(
        Long id,
        String tipo,
        Double monto,
        String referencia,
        LocalDate fecha,
        String bancoOrigen,
        String bancoDestino,
        String beneficiario,
        String telefono,
        String identificacion,
        String concepto,
        Boolean procesado,
        LocalDateTime fechaCreacion,
        CategoriaResumenDTO categoria,
        Boolean esIngreso,
        Double montoDolar
) {}