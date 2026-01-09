package com.edc.api.repository;

import com.edc.api.model.Movimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    // Busca por rango de fechas y soporta paginación
    Page<Movimiento> findByFechaEfecBetween(
            LocalDate inicio,
            LocalDate fin,
            Pageable pageable
    );
}
