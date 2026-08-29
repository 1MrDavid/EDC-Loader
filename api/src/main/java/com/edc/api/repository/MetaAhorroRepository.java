package com.edc.api.repository;

import com.edc.api.model.MetaAhorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaAhorroRepository extends JpaRepository<MetaAhorro, Long> {

    List<MetaAhorro> findByActivaTrue();

    boolean existsByCuentaAhorro_Id(Long cuentaAhorroId);
}
