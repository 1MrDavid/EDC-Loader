package com.edc.api.dto;

import java.time.LocalDate;

public record MovimientoDTO(
        Long id,
        Long cuentaId,

        LocalDate fechaAdd,
        LocalDate fechavalor,
        LocalDate fechaefec,

        String referencia,
        String descripcion,

        Double egreso,
        Double ingreso,
        Double saldo,

        Double ingresodolar,
        Double egresodolar,
        Double saldodolar,
        Double tasadolar,

        String categoria
) {
}
