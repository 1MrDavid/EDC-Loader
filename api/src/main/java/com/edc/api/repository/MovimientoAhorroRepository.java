package com.edc.api.repository;

import com.edc.api.model.MovimientoAhorro;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoAhorroRepository extends JpaRepository<MovimientoAhorro, Long> {

    @EntityGraph(attributePaths = {"categoria", "deuda"})
    List<MovimientoAhorro> findByCuentaAhorroIdOrderByFechaDescIdDesc(Long cuentaAhorroId);

    void deleteByCuentaAhorroId(Long cuentaAhorroId);
}