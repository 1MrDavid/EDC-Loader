package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reglas_categorizacion")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReglaCategorizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patron;

    @Column(name = "tipo_patron")
    private String tipoPatron;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    private Boolean activa;
}
