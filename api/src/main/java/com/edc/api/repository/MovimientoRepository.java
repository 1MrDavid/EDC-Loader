package com.edc.api.repository;

import com.edc.api.dto.FlujoDiarioDTO;
import com.edc.api.model.Movimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edc.api.model.Categoria;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDate;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    // Busca por rango de fechas y soporta paginación
    @Query("""
        SELECT m
        FROM Movimiento m
        WHERE m.fechaEfec BETWEEN :inicio AND :fin
          AND (:cuentaId IS NULL OR m.cuentaId = :cuentaId)
    """)
    Page<Movimiento> findMovimientos(
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("cuentaId") Integer cuentaId,
            Pageable pageable
    );

    @Query(value = """
        SELECT MAX(fecha) FROM (
            SELECT fechaefec AS fecha FROM movimientos
            UNION ALL
            SELECT fecha FROM registros_bot
        ) AS fechas
    """, nativeQuery = true)
    LocalDate findMaxFechaValor();

    @Query(value = """
        SELECT MAX(fecha) FROM (
            SELECT fechaefec AS fecha FROM movimientos WHERE (:cuentaId IS NULL OR cuenta_id = :cuentaId)
            UNION ALL
            SELECT fecha FROM registros_bot
        ) AS fechas
    """, nativeQuery = true)
    LocalDate findMaxFechaValorByCuenta(@Param("cuentaId") int cuentaId);

    @Query(value = """
    WITH dias AS (
        SELECT generate_series(
            date_trunc('month', CAST(:periodo AS DATE)),
            (date_trunc('month', CAST(:periodo AS DATE)) + INTERVAL '1 month - 1 day'),
            INTERVAL '1 day'
        )::date AS fecha
    )
    SELECT
        d.fecha AS fecha,
        COALESCE(COUNT(m.ingreso), 0) AS ingresos,
        COALESCE(COUNT(m.egreso), 0) AS egresos,
        COALESCE(SUM(m.ingreso), 0) AS totalIngresos,
        COALESCE(SUM(m.egreso), 0) AS totalEgresos
    FROM dias d
    LEFT JOIN movimientos m
        ON m.cuenta_id = :cuentaId
        AND m.fechavalor = d.fecha
    GROUP BY d.fecha
    ORDER BY d.fecha
""", nativeQuery = true)
    List<FlujoDiarioDTO> findFlujoDiarioByMes(
            @Param("periodo") LocalDate periodo,
            @Param("cuentaId") int cuentaId
    );

    @Modifying
    @Query("""
        UPDATE Movimiento m
        SET m.categoria = :categoria
        WHERE m.categoria IS NULL
        AND (LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :patron, '%'))
             OR LOWER(m.referencia) LIKE LOWER(CONCAT('%', :patron, '%')))
    """)
    int aplicarCategoriaRetroactiva(@Param("categoria") Categoria categoria, @Param("patron") String patron);

    @Modifying
    @Query(value = """
        UPDATE movimientos
        SET categoria_id = :categoriaId
        WHERE id = :movimientoId
    """, nativeQuery = true)
    int asignarCategoriaMovimiento(
            @Param("movimientoId") Long movimientoId,
            @Param("categoriaId") Long categoriaId
    );
}
