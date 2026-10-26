package com.edc.api.repository;

import com.edc.api.model.ValorDolar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ValorDolarRepository extends JpaRepository<ValorDolar, Integer> {

    List<ValorDolar> findAllByOrderByAnoAscMesAscDiaAsc();

    List<ValorDolar> findByAnoOrderByMesAscDiaAsc(int ano);

    @Query("SELECT DISTINCT v.ano FROM ValorDolar v ORDER BY v.ano DESC")
    List<Integer> findDistinctAnosDesc();

    boolean existsByFecha(Integer fecha);

    boolean existsByAnoAndMesAndDia(int ano, int mes, int dia);

    Optional<ValorDolar> findByFecha(Integer fecha);

    @Query(value = "SELECT precio FROM valor_dolar ORDER BY fecha DESC LIMIT 1", nativeQuery = true)
    Double obtenerTasaMasReciente();
}
