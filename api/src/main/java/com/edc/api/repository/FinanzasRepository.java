package com.edc.api.repository;

import com.edc.api.model.Finanzas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinanzasRepository extends JpaRepository<Finanzas, Long> {
}
