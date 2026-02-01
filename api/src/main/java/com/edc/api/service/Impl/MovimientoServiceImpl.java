package com.edc.api.service.Impl;

import com.edc.api.dto.FlujoDiarioDTO;
import com.edc.api.dto.MovimientoDTO;
import com.edc.api.mapper.MovimientoMapper;
import com.edc.api.repository.MovimientoRepository;
import com.edc.api.service.MovimientoService;
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
            Integer cuentaId,
            Pageable pageable
    ) {
        return repository
                .findMovimientos(inicio, fin, cuentaId, pageable)
                .map(mapper::toDto);
    }

    @Override
    public LocalDate obtenerFechaValorMasReciente() {
        LocalDate fecha = repository.findMaxFechaValor();
        return fecha != null ? fecha.withDayOfMonth(1) : null;
    }

    @Override
    public LocalDate obtenerFechaValorMasReciente(int cuentaId) {
        LocalDate fecha = repository.findMaxFechaValorByCuenta(cuentaId);
        return fecha != null ? fecha.withDayOfMonth(1) : null;
    }

    @Override
    public List<FlujoDiarioDTO> obtenerFlujoDiarioPorMes(LocalDate periodo, int cuentaId) {
        return repository.findFlujoDiarioByMes(periodo, cuentaId);
    }
}
