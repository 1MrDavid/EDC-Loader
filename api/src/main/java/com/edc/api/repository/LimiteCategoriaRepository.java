package com.edc.api.repository;

import com.edc.api.model.LimiteCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LimiteCategoriaRepository extends JpaRepository<LimiteCategoria, Long> {

    List<LimiteCategoria> findByActivaTrueAndMesIsNullAndAnoIsNull();

    List<LimiteCategoria> findByActivaTrueAndMesAndAno(Integer mes, Integer ano);

    @Query("""
            SELECT l FROM LimiteCategoria l
            JOIN FETCH l.categoria
            WHERE l.activa = true
              AND ((l.mes IS NULL AND l.ano IS NULL) OR (l.mes = :mes AND l.ano = :ano))
            """)
    List<LimiteCategoria> findLimitesAplicables(@Param("mes") int mes, @Param("ano") int ano);
}
