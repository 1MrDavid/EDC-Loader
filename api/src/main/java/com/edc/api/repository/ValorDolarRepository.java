package com.edc.api.repository;

import com.edc.api.model.ValorDolar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ValorDolarRepository extends JpaRepository<ValorDolar, Integer> {

    List<ValorDolar> findAllByOrderByAnoAscMesAscDiaAsc();

    boolean existsByFecha(Integer fecha);

    @Query(value = "SELECT precio FROM valor_dolar ORDER BY fecha DESC LIMIT 1", nativeQuery = true)
    Double obtenerTasaMasReciente();
}
