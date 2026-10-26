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
        Long registroBotId,
        Long categoriaId,
        String categoriaNombre,
        String categoriaColor,
        String categoriaIcono,
        Long deudaId,
        String deudaNombre
) {}
