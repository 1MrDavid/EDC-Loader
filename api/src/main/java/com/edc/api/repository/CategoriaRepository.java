package com.edc.api.repository;

import com.edc.api.dto.CategoriaResumenMesDTO;
import com.edc.api.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByActivaTrue();

    @Query("""
        SELECT new com.edc.api.dto.CategoriaResumenMesDTO(
            c.id, c.nombre, c.tipo, c.color, c.icono,
            COUNT(m.id),
            COALESCE(SUM(CASE WHEN c.tipo = 'EGRESO' THEN m.egresodolar ELSE m.ingresodolar END), 0.0)
        )
        FROM Categoria c
        LEFT JOIN Movimiento m ON m.categoria.id = c.id 
              AND m.fechaEfec BETWEEN :inicio AND :fin
        GROUP BY c.id, c.nombre, c.tipo, c.color, c.icono
    """)
    List<CategoriaResumenMesDTO> obtenerResumenPorMes(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}