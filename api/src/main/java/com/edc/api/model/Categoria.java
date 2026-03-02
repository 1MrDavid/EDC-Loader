package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categorias")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    private String tipo; // INGRESO / EGRESO

    private Boolean activa;
}
