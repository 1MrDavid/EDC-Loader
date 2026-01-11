package com.edc.api.repository;

import com.edc.api.model.BalanceMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;

public interface BalanceMensualRepository
        extends JpaRepository<BalanceMensual, Long> {

    @Query("SELECT b FROM BalanceMensual b WHERE b.cuenta_id = ?1 AND b.periodo = ?2")
    Optional<BalanceMensual> findByCuenta_idAndPeriodo(int id, LocalDate periodo);
}
