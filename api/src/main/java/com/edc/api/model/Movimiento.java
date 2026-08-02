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

    @Column(name = "beneficiario")
    private String beneficiario;

    @Column(name = "identificacion")
    private String identificacion;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "banco_destino")
    private String bancoDestino;

    private Double egreso;
    private Double ingreso;
    private Double saldo;

    private Double ingresodolar;
    private Double egresodolar;
    private Double saldodolar;
    private Double tasadolar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;
}