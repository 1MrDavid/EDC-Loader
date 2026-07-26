package com.edc.api.repository;

import com.edc.api.model.ReglaCategorizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReglaCategorizacionRepository extends JpaRepository<ReglaCategorizacion, Long> {
    List<ReglaCategorizacion> findByActivaTrue();
}