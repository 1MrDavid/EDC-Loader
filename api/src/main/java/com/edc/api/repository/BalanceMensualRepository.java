package com.edc.api.repository;

import com.edc.api.dto.BalancesMensualesDTO;
import com.edc.api.model.BalanceMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BalanceMensualRepository
        extends JpaRepository<BalanceMensual, Long> {

    @Query("SELECT b FROM BalanceMensual b WHERE b.cuenta_id = ?1 AND b.periodo = ?2")
    Optional<BalanceMensual> findByCuenta_idAndPeriodo(int id, LocalDate periodo);

    @Query("""
    SELECT 
        b.periodo AS periodo,
        SUM(b.ingresos_total) AS totalIngresos,
        SUM(b.egresos_total) AS totalEgresos
    FROM BalanceMensual b
    GROUP BY b.periodo
    ORDER BY b.periodo
    """)

    List<BalancesMensualesDTO> findResumenMensualGlobal();
    @Query("""
    SELECT 
        b.periodo AS periodo,
        b.ingresos_total AS totalIngresos,
        b.egresos_total AS totalEgresos
    FROM BalanceMensual b
    WHERE b.cuenta_id = :cuentaId
    ORDER BY b.periodo
    """)
    List<BalancesMensualesDTO> findResumenMensualPorCuenta(
            @Param("cuentaId") int cuentaId
    );
}
