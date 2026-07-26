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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo; // INGRESO / EGRESO
    
    private String color; // Ej: "#ef4444" o "bg-red-500"
    private String icono; // Ej: "shopping-bag" o un emoji "🛒"

    private Boolean activa;
}