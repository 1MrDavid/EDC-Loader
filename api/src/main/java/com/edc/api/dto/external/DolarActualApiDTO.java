package com.edc.api.dto.external;

public record DolarActualApiDTO(
    String moneda,
    String fuente,
    String nombre,
    Double promedio,
    String fechaActualizacion // Formato: "2026-08-07T00:00:00-04:00"
) {}