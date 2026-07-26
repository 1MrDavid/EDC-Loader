package com.edc.api.service.Impl;

import com.edc.api.dto.FlujoDiarioDTO;
import com.edc.api.dto.MovimientoDTO;
import com.edc.api.mapper.MovimientoMapper;
import com.edc.api.model.Categoria;
import com.edc.api.model.ReglaCategorizacion;
import com.edc.api.repository.MovimientoRepository;
import com.edc.api.repository.ReglaCategorizacionRepository;
import com.edc.api.service.MovimientoService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class MovimientoServiceImpl implements MovimientoService {
    
    private final MovimientoRepository repository;
    private final MovimientoMapper mapper;
    private final ReglaCategorizacionRepository reglaRepository;

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

    @Override
    @Transactional
    public int aplicarReglaMasiva(Categoria categoria, String patron) {
        return repository.aplicarCategoriaRetroactiva(categoria, patron);
    }

    @Override
    @Async
    @Transactional
    public void aplicarTodasLasReglas() {
        log.info("Iniciando proceso asíncrono de categorización masiva...");
        List<ReglaCategorizacion> reglasActivas = reglaRepository.findByActivaTrue();
        
        int totalActualizados = 0;
        for (ReglaCategorizacion regla : reglasActivas) {
            int actualizados = repository.aplicarCategoriaRetroactiva(
                    regla.getCategoria(),
                    regla.getPatron()
            );
            totalActualizados += actualizados;
        }
        
        log.info("Categorización masiva completada. Se actualizaron {} movimientos en total.", totalActualizados);
    }
}
