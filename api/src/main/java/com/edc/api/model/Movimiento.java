package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "movimientos")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuenta_id")
    private Long cuentaId;

    @Column(name = "fechaadd")
    private LocalDate fechaAdd;

    private LocalDate fechavalor;

    @Column(name = "fechaefec")
    private LocalDate fechaEfec;

    private String referencia;

    private String descripcion;

    private Double egreso;
    private Double ingreso;
    private Double saldo;

    private Double ingresodolar;
    private Double egresodolar;
    private Double saldodolar;
    private Double tasadolar;

    private String categoria;
}
