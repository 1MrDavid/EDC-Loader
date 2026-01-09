package com.edc.api.service;

import com.edc.api.dto.MovimientoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface MovimientoService {

    Page<MovimientoDTO> obtenerPorPagina(
            LocalDate inicio,
            LocalDate fin,
            Pageable pageable
    );
}
