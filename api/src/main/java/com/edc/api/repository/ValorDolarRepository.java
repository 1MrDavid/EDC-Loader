package com.edc.api.repository;

import com.edc.api.model.ValorDolar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ValorDolarRepository extends JpaRepository<ValorDolar, Integer> {

    List<ValorDolar> findAllByOrderByAnoAscMesAscDiaAsc();
}
