package com.edc.api.dto.external;

public record DolarHistoricoApiDTO(
    String fuente,
    Double promedio,
    String fecha // Formato: "2023-01-03"
) {}