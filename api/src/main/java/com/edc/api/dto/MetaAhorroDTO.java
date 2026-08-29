package com.edc.api.dto;

import java.time.LocalDate;

public record MetaAhorroDTO(
        Long id,
        String nombre,
        Long cuentaAhorroId,
        String cuentaAhorroNombre,
        Double montoObjetivoUsd,
        LocalDate fechaLimite,
        Boolean activa,
        Double saldoActualUsd,
        Double porcentajeAvance,
        Integer mesesEstimadosRestantes
) {}
