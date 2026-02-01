package com.edc.api.repository;

import com.edc.api.dto.FlujoDiarioDTO;
import com.edc.api.model.Movimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("SELECT MAX(m.fechavalor) FROM Movimiento m")
    LocalDate findMaxFechaValor();

    @Query("""
        SELECT MAX(m.fechavalor)
        FROM Movimiento m
        WHERE m.cuentaId = :cuentaId
    """)
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
}
