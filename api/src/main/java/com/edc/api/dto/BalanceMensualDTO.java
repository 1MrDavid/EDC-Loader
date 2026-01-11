package com.edc.api.dto;

import java.time.LocalDate;

public record BalanceMensualDTO(
        int cuenta_id,
        LocalDate periodo,

        double monto_inicio,
        double monto_final,
        double ingresos_total,
        double egresos_total,
        int numero_ingresos,
        int numero_egresos,

        double saldo_variacion,
        double flujo_neto,
        double promedio_ingreso,
        double promedio_egreso
) {
}
