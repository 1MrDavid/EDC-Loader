package com.edc.api.service;

import com.edc.api.dto.MovimientoDTO;
import com.edc.api.mapper.MovimientoMapper;
import com.edc.api.repository.MovimientoRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class MovimientoServiceImpl implements MovimientoService {
    private final MovimientoRepository repository;
    private final MovimientoMapper mapper;

    @Override
    public Page<MovimientoDTO> obtenerPorPagina(
            LocalDate inicio,
            LocalDate fin,
            Pageable pageable
    ) {
        return repository
                .findByFechaEfecBetween(inicio, fin, pageable)
                .map(mapper::toDto);
    }
}
