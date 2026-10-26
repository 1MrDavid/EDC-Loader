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

    private LocalDate fecha;

    @Column(name = "movimiento_id")
    private Long movimientoId;

    @Column(name = "registro_bot_id")
    private Long registroBotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deuda_id")
    private Deuda deuda;
}
