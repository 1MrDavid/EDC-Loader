package com.edc.api.repository;

import com.edc.api.model.Categoria;
import com.edc.api.model.RegistroBot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroBotRepository extends JpaRepository<RegistroBot, Long> {

    List<RegistroBot> findByProcesadoFalseOrderByFechaCreacionDesc();

    List<RegistroBot> findByProcesadoFalseAndCategoriaId(Long categoriaId);

    @Modifying
    @Query("""
        UPDATE RegistroBot r
        SET r.categoria = :categoria
        WHERE r.categoria IS NULL
        AND r.procesado = false
        AND LOWER(r.concepto) LIKE LOWER(CONCAT('%', :patron, '%'))
    """)
    int aplicarReglaPorConcepto(@Param("categoria") Categoria categoria, @Param("patron") String patron);

    @Modifying
    @Query("""
        UPDATE RegistroBot r
        SET r.categoria = :categoria
        WHERE r.categoria IS NULL
        AND r.procesado = false
        AND LOWER(r.beneficiario) LIKE LOWER(CONCAT('%', :patron, '%'))
    """)
    int aplicarReglaPorBeneficiario(@Param("categoria") Categoria categoria, @Param("patron") String patron);

    @Modifying
    @Query("""
        UPDATE RegistroBot r
        SET r.categoria = :categoria
        WHERE r.categoria IS NULL
        AND r.procesado = false
        AND LOWER(r.referencia) LIKE LOWER(CONCAT('%', :patron, '%'))
    """)
    int aplicarReglaPorReferencia(@Param("categoria") Categoria categoria, @Param("patron") String patron);
}
