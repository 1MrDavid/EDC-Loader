package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "balance_mensual",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"cuenta_id", "periodo"})
        })
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BalanceMensual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int cuenta_id;
    private LocalDate periodo;

    private double monto_inicio;
    private double monto_final;
    private double ingresos_total;
    private double egresos_total;

    private int numero_ingresos;
    private int numero_egresos;

    private double saldo_variacion;
    private double flujo_neto;
    private double promedio_ingreso;
    private double promedio_egreso;

    private double ingresos_total_dolar;
    private double egresos_total_dolar;
}

