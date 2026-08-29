package com.edc.api.dto;

import java.time.LocalDate;

public record ActualizarMetaDTO(
        String nombre,
        Long cuentaAhorroId,
        Double montoObjetivoUsd,
        LocalDate fechaLimite,
        Boolean activa
) {}
