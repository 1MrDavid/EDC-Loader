package com.edc.api.dto;

public record CrearReglaDTO(
        String patron,
        String tipoPatron, // CONCEPTO, BENEFICIARIO, REFERENCIA (DESCRIPCION es alias de CONCEPTO)
        Long categoriaId
) {
}