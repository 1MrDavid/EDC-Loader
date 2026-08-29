package com.edc.api.util;

import com.edc.api.model.Deuda;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public final class PeriodoDeudaUtil {

    private PeriodoDeudaUtil() {}

    public record Periodo(LocalDate inicio, LocalDate fin) {}

    public static Periodo calcularPeriodo(Deuda deuda, LocalDate fechaReferencia) {
        String frecuencia = deuda.getFrecuencia().toUpperCase();
        return switch (frecuencia) {
            case "MENSUAL" -> new Periodo(
                    fechaReferencia.withDayOfMonth(1),
                    fechaReferencia.withDayOfMonth(fechaReferencia.lengthOfMonth())
            );
            case "SEMANAL" -> new Periodo(
                    fechaReferencia.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                    fechaReferencia.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
            );
            case "UNA_VEZ", "DEFINIDA" -> new Periodo(fechaReferencia, fechaReferencia);
            default -> new Periodo(fechaReferencia, fechaReferencia);
        };
    }

    public static boolean esDeudaCiclicaPendienteEnPeriodo(
            Deuda deuda,
            LocalDate fechaReferencia,
            boolean existePagoEnPeriodo
    ) {
        String frecuencia = deuda.getFrecuencia().toUpperCase();
        if ("DEFINIDA".equals(frecuencia)) {
            return true;
        }
        if ("UNA_VEZ".equals(frecuencia)) {
            return !existePagoEnPeriodo;
        }
        return !existePagoEnPeriodo;
    }
}
