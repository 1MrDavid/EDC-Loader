package com.edc.api.service.Impl;

import com.edc.api.dto.FlujoDiarioDTO;
import com.edc.api.dto.MovimientoDTO;
import com.edc.api.dto.RuleApplicationResult;
import com.edc.api.mapper.MovimientoMapper;
import com.edc.api.model.Categoria;
import com.edc.api.model.Movimiento;
import com.edc.api.model.ReglaCategorizacion;
import com.edc.api.repository.MovimientoRepository;
import com.edc.api.repository.ReglaCategorizacionRepository;
import com.edc.api.service.MovimientoService;
import com.edc.api.service.PagoDeudaService;
import com.edc.api.service.ReglaCategorizacionApplier;

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
    private final ReglaCategorizacionApplier reglaApplier;
    private final PagoDeudaService pagoDeudaService;

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
    public int aplicarReglaMasiva(Categoria categoria, String patron, String tipoPatron) {
        RuleApplicationResult result = reglaApplier.aplicar(categoria, patron, tipoPatron);
        return result.total();
    }

    @Override
    @Async
    @Transactional
    public void aplicarTodasLasReglas() {
        log.info("Iniciando proceso asíncrono de categorización masiva...");
        List<ReglaCategorizacion> reglasActivas = reglaRepository.findByActivaTrue();
        
        int totalActualizados = 0;
        for (ReglaCategorizacion regla : reglasActivas) {
            RuleApplicationResult result = reglaApplier.aplicar(
                    regla.getCategoria(),
                    regla.getPatron(),
                    regla.getTipoPatron()
            );
            totalActualizados += result.total();
        }
        
        log.info("Categorización masiva completada. Se actualizaron {} registros en total.", totalActualizados);
    }

    @Override
    @Transactional
    public void asignarCategoriaMovimiento(Long categoriaId, Long movimientoId) {
        repository.asignarCategoriaMovimiento(movimientoId, categoriaId);

        Movimiento movimiento = repository.findById(movimientoId).orElse(null);
        if (movimiento != null) {
            Double montoBs = movimiento.getEgreso() != null ? movimiento.getEgreso() : movimiento.getIngreso();
            Double montoUsd = movimiento.getEgresodolar() != null ? movimiento.getEgresodolar() : movimiento.getIngresodolar();
            boolean esIngreso = movimiento.getIngreso() != null && movimiento.getIngreso() > 0;
            java.time.LocalDate fecha = movimiento.getFechaEfec() != null ? movimiento.getFechaEfec() : movimiento.getFechavalor();

            pagoDeudaService.intentarAutoMatch(
                    categoriaId, fecha, montoBs, montoUsd, esIngreso, null, movimientoId
            );
        }
    }
}
