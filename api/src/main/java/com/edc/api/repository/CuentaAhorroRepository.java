package com.edc.api.repository;

import com.edc.api.model.CuentaAhorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuentaAhorroRepository extends JpaRepository<CuentaAhorro, Long> {
}