package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Entity
@Table(name = "reglas_categorizacion")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReglaCategorizacion {

    @Id
    @GeneratedValue
    private Long id;

    private String patron;

    @Column(name = "tipo_patron")
    private String tipoPatron;

    @Column(name = "categoria_id")
    @ManyToOne
    private Categoria categoria;

    private Boolean activa;
}
