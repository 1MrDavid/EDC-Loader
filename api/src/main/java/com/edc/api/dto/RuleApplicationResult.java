package com.edc.api.dto;

public record RuleApplicationResult(
        int movimientosActualizados,
        int registrosBotActualizados
) {
    public int total() {
        return movimientosActualizados + registrosBotActualizados;
    }
}
