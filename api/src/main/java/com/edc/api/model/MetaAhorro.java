package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "metas_ahorro")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaAhorro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_ahorro_id")
    private CuentaAhorro cuentaAhorro;

    @Column(name = "monto_objetivo_usd")
    private Double montoObjetivoUsd;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    private Boolean activa;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}