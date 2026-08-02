package com.edc.api.repository;

import com.edc.api.model.RegistroBot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroBotRepository extends JpaRepository<RegistroBot, Long> {
    
    // Trae todos los procesado = false, ordenados por el más reciente primero
    List<RegistroBot> findByProcesadoFalseOrderByFechaCreacionDesc();
}