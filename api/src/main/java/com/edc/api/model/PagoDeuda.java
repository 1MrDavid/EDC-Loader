package com.edc.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "pagos_deuda")
@Data
public class PagoDeuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deuda_id")
    private Deuda deuda;

    @Column(name = "monto_pagado_bs")
    private Double montoPagadoBs;

    @Column(name = "monto_pagado_usd")
    private Double montoPagadoUsd;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "movimiento_id")
    private Long movimientoId;

    @Column(name = "registro_bot_id")
    private Long registroBotId;

    @Column(name = "origen")
    private String origen;

    @Column(name = "movimiento_ahorro_id")
    private Long movimientoAhorroId;
}