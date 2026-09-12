package com.edc.api.util;

import com.edc.api.model.Deuda;
import com.edc.api.model.Frecuencia;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

public final class PeriodoDeudaUtil {

    private PeriodoDeudaUtil() {}

    public record Periodo(LocalDate inicio, LocalDate fin) {}

    public static Periodo calcularPeriodo(Deuda deuda, LocalDate fechaReferencia) {
        Frecuencia frecuencia = Frecuencia.from(deuda.getFrecuencia());
        return switch (frecuencia) {
            case MENSUAL -> new Periodo(
                    fechaReferencia.withDayOfMonth(1),
                    fechaReferencia.withDayOfMonth(fechaReferencia.lengthOfMonth())
            );
            case SEMANAL -> new Periodo(
                    fechaReferencia.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                    fechaReferencia.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
            );
            case QUINCENAL -> periodoQuincenal(deuda, fechaReferencia);
            case UNA_VEZ, DEFINIDA -> new Periodo(fechaReferencia, fechaReferencia);
        };
    }

    public static boolean esDeudaCiclicaPendienteEnPeriodo(
            Deuda deuda,
            LocalDate fechaReferencia,
            boolean existePagoEnPeriodo
    ) {
        Frecuencia frecuencia = Frecuencia.from(deuda.getFrecuencia());
        if (frecuencia == Frecuencia.DEFINIDA) {
            return true;
        }
        if (frecuencia == Frecuencia.UNA_VEZ) {
            return !existePagoEnPeriodo;
        }
        return !existePagoEnPeriodo;
    }

    private static Periodo periodoQuincenal(Deuda deuda, LocalDate fechaReferencia) {
        LocalDate ancla = deuda.getFechaInicio() != null ? deuda.getFechaInicio() : fechaReferencia;
        long dias = ChronoUnit.DAYS.between(ancla, fechaReferencia);
        long ciclo = dias >= 0 ? dias / 14 : 0;
        LocalDate inicio = ancla.plusDays(ciclo * 14);
        return new Periodo(inicio, inicio.plusDays(13));
    }
}
