package com.edc.api.repository;

import com.edc.api.model.Deuda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeudaRepository extends JpaRepository<Deuda, Long> {
    List<Deuda> findByActivaTrue();

    Optional<Deuda> findByActivaTrueAndCategoriaId(Long categoriaId);

    boolean existsByActivaTrueAndCategoriaId(Long categoriaId);

    boolean existsByActivaTrueAndCategoriaIdAndIdNot(Long categoriaId, Long id);
}
