package com.edc.api.model;

public enum Frecuencia {
    MENSUAL,
    SEMANAL,
    QUINCENAL,
    UNA_VEZ,
    DEFINIDA;

    public static Frecuencia from(String valor) {
        if (valor == null || valor.isBlank()) {
            return UNA_VEZ;
        }
        try {
            return valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return UNA_VEZ;
        }
    }
}
