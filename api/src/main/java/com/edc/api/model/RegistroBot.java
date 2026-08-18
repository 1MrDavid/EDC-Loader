package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_bot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroBot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    
    private Double monto;
    
    private String referencia;
    
    private LocalDate fecha;
    
    @Column(name = "banco_origen")
    private String bancoOrigen;
    
    @Column(name = "banco_destino")
    private String bancoDestino;
    
    private String beneficiario;
    
    private String telefono;
    
    private String identificacion;
    
    private String concepto;
    
    private Boolean procesado;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "es_ingreso")
    private Boolean esIngreso;

    @Column(name = "monto_dolar")
    private Double montoDolar;
}