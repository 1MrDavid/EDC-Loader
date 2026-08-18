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

    @Query(value = """
        WITH todos_los_movimientos AS (
            -- 1. Movimientos oficiales consolidados (Ya en dólares)
            SELECT categoria_id, fechaefec as fecha, 
                   COALESCE(ingresodolar, ingreso) as ingreso, 
                   COALESCE(egresodolar, egreso) as egreso
            FROM movimientos
            WHERE fechaefec BETWEEN :inicio AND :fin
            
            UNION ALL
            
            -- 2. Movimientos flotantes (En Vivo)
            SELECT categoria_id, fecha,
                   CASE WHEN es_ingreso = true THEN COALESCE(monto_dolar, 0.0) ELSE 0.0 END as ingreso,
                   CASE WHEN es_ingreso = false THEN COALESCE(monto_dolar, 0.0) ELSE 0.0 END as egreso
            FROM registros_bot
            WHERE procesado = false 
              AND categoria_id IS NOT NULL 
              AND fecha BETWEEN :inicio AND :fin
        )
        SELECT 
            c.id, c.nombre, c.tipo, c.color, c.icono,
            CAST(COUNT(m.categoria_id) AS bigInt) as movimientosMes,
            CAST(COALESCE(SUM(CASE WHEN c.tipo = 'EGRESO' THEN m.egreso ELSE m.ingreso END), 0.0) AS double precision) as montoTotalDolar
        FROM categorias c
        LEFT JOIN todos_los_movimientos m ON m.categoria_id = c.id
        WHERE c.id != 6 -- Ignorar la categoría de transferencias internas
        GROUP BY c.id, c.nombre, c.tipo, c.color, c.icono
    """, nativeQuery = true)
    List<CategoriaResumenMesDTO> obtenerResumenPorMes(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}