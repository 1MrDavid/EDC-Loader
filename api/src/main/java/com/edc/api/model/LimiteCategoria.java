package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "limites_categoria", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"categoria_id", "mes", "ano"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LimiteCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "monto_usd")
    private Double montoUsd;

    // NULL = Global, Valor = Específico de ese período
    private Integer mes;
    private Integer ano;

    private Boolean activa;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}