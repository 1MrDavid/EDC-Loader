package com.edc.api.dto;

import java.time.LocalDate;

public record CrearMetaDTO(
        String nombre,
        Long cuentaAhorroId,
        Double montoObjetivoUsd,
        LocalDate fechaLimite
) {}
