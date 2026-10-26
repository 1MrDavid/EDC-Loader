package com.edc.api.dto;

import java.time.LocalDate;

public record CrearMovimientoAhorroDTO(
        Long cuentaAhorroId,
        String tipoOperacion,
        Double monto,
        String descripcion,
        LocalDate fecha,
        Long categoriaId,
        Long deudaId
) {}
