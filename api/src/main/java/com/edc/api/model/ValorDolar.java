package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "valor_dolar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValorDolar {

    @Id
    @Column(name = "fecha")
    private Integer fecha; // 20250901

    private int dia;
    private int mes;
    private int ano;

    private double precio;
}

