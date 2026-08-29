package com.edc.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "movimientos_ahorro")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovimientoAhorro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuenta_ahorro_id") 
    private Long cuentaAhorroId;

    @Column(name = "tipo_operacion")
    private String tipoOperacion;

    private Double monto;

    private String descripcion;

    // Corregido de Double a LocalDate
    private LocalDate fecha;

    // Corregido de Double a Long
    @Column(name = "movimiento_id")
    private Long movimientoId;

    // Corregido de Double a Long
    @Column(name = "registro_bot_id")
    private Long registroBotId;
}