package com.edc.api.service.Impl;

import com.edc.api.dto.CategoriaResumenDTO;
import com.edc.api.dto.PagoDeudaDTO;
import com.edc.api.dto.RegistrarPagoDeudaDTO;
import com.edc.api.model.Deuda;
import com.edc.api.model.PagoDeuda;
import com.edc.api.model.RegistroBot;
import com.edc.api.repository.DeudaRepository;
import com.edc.api.repository.PagoDeudaRepository;
import com.edc.api.repository.RegistroBotRepository;
import com.edc.api.service.PagoDeudaService;
import com.edc.api.util.PeriodoDeudaUtil;
import com.edc.api.util.PeriodoDeudaUtil.Periodo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoDeudaServiceImpl implements PagoDeudaService {

    private final PagoDeudaRepository pagoDeudaRepository;
    private final DeudaRepository deudaRepository;
    private final RegistroBotRepository registroBotRepository;

    @Override
    @Transactional
    public PagoDeudaDTO registrarPago(RegistrarPagoDeudaDTO dto) {
        Deuda deuda = deudaRepository.findById(dto.deudaId())
                .orElseThrow(() -> new IllegalArgumentException("Deuda no encontrada"));

        if (dto.registroBotId() != null) {
            pagoDeudaRepository.findByRegistroBotId(dto.registroBotId())
                    .ifPresent(p -> {
                        throw new IllegalArgumentException("Este registro ya tiene un pago de deuda asociado");
                    });
        }
        if (dto.movimientoId() != null) {
            pagoDeudaRepository.findByMovimientoId(dto.movimientoId())
                    .ifPresent(p -> {
                        throw new IllegalArgumentException("Este movimiento ya tiene un pago de deuda asociado");
                    });
        }

        validarPeriodoDisponible(deuda, dto.fechaPago());

        String origen = dto.origen() != null ? dto.origen().toUpperCase() : "MANUAL";
        PagoDeuda pago = construirPago(deuda, dto.fechaPago(), dto.montoPagadoBs(), dto.montoPagadoUsd(),
                dto.registroBotId(), dto.movimientoId(), origen);

        PagoDeuda guardado = pagoDeudaRepository.save(pago);
        desactivarDeudaSiUnaVez(deuda);

        return mapToDto(guardado);
    }

    @Override
    @Transactional
    public void eliminarPago(Long id) {
        pagoDeudaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Optional<PagoDeudaDTO> intentarAutoMatch(
            Long categoriaId,
            java.time.LocalDate fecha,
            Double montoBs,
            Double montoUsd,
            Boolean esIngreso,
            Long registroBotId,
            Long movimientoId
    ) {
        if (categoriaId == null || Boolean.TRUE.equals(esIngreso) || fecha == null) {
            return Optional.empty();
        }

        if (registroBotId != null && pagoDeudaRepository.findByRegistroBotId(registroBotId).isPresent()) {
            return Optional.empty();
        }
        if (movimientoId != null && pagoDeudaRepository.findByMovimientoId(movimientoId).isPresent()) {
            return Optional.empty();
        }

        Optional<Deuda> deudaOpt = deudaRepository.findByActivaTrueAndCategoriaId(categoriaId);
        if (deudaOpt.isEmpty()) {
            return Optional.empty();
        }

        Deuda deuda = deudaOpt.get();
        Periodo periodo = PeriodoDeudaUtil.calcularPeriodo(deuda, fecha);
        boolean yaPagada = pagoDeudaRepository.existsByDeudaIdAndFechaPagoBetween(
                deuda.getId(), periodo.inicio(), periodo.fin());

        if (!PeriodoDeudaUtil.esDeudaCiclicaPendienteEnPeriodo(deuda, fecha, yaPagada)) {
            return Optional.empty();
        }

        PagoDeuda pago = construirPago(deuda, fecha, montoBs, montoUsd, registroBotId, movimientoId, "AUTO");
        PagoDeuda guardado = pagoDeudaRepository.save(pago);
        desactivarDeudaSiUnaVez(deuda);

        log.info("Auto-match: pago registrado para deuda '{}' (categoria {})", deuda.getNombre(), categoriaId);
        return Optional.of(mapToDto(guardado));
    }

    @Override
    @Transactional
    public void revertirPagosAutoPorRegistroBot(Long registroBotId) {
        pagoDeudaRepository.deleteByRegistroBotIdAndOrigen(registroBotId, "AUTO");
    }

    @Override
    @Transactional
    public void autoMatchRegistrosBotPorCategoria(Long categoriaId) {
        registroBotRepository.findByProcesadoFalseAndCategoriaId(categoriaId).forEach(registro -> {
            intentarAutoMatch(
                    categoriaId,
                    registro.getFecha(),
                    registro.getMonto(),
                    registro.getMontoDolar(),
                    registro.getEsIngreso(),
                    registro.getId(),
                    null
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PagoDeudaDTO> obtenerPorRegistroBot(Long registroBotId) {
        return pagoDeudaRepository.findByRegistroBotId(registroBotId).map(this::mapToDto);
    }

    private void validarPeriodoDisponible(Deuda deuda, java.time.LocalDate fechaPago) {
        if ("DEFINIDA".equalsIgnoreCase(deuda.getTipoDeuda())) {
            return;
        }
        Periodo periodo = PeriodoDeudaUtil.calcularPeriodo(deuda, fechaPago);
        if (pagoDeudaRepository.existsByDeudaIdAndFechaPagoBetween(deuda.getId(), periodo.inicio(), periodo.fin())) {
            throw new IllegalArgumentException("La deuda ya fue pagada en este período");
        }
    }

    private PagoDeuda construirPago(
            Deuda deuda,
            java.time.LocalDate fecha,
            Double montoBs,
            Double montoUsd,
            Long registroBotId,
            Long movimientoId,
            String origen
    ) {
        PagoDeuda pago = new PagoDeuda();
        pago.setDeuda(deuda);
        pago.setFechaPago(fecha);
        pago.setMontoPagadoBs(montoBs);
        pago.setMontoPagadoUsd(montoUsd);
        pago.setRegistroBotId(registroBotId);
        pago.setMovimientoId(movimientoId);
        pago.setOrigen(origen);
        return pago;
    }

    private void desactivarDeudaSiUnaVez(Deuda deuda) {
        if ("UNA_VEZ".equalsIgnoreCase(deuda.getFrecuencia())) {
            deuda.setActiva(false);
            deudaRepository.save(deuda);
        }
    }

    private PagoDeudaDTO mapToDto(PagoDeuda pago) {
        Deuda deuda = pago.getDeuda();
        CategoriaResumenDTO catDto = null;
        if (deuda != null && deuda.getCategoria() != null) {
            catDto = new CategoriaResumenDTO(
                    deuda.getCategoria().getId(),
                    deuda.getCategoria().getNombre(),
                    deuda.getCategoria().getColor(),
                    deuda.getCategoria().getIcono()
            );
        }
        return new PagoDeudaDTO(
                pago.getId(),
                pago.getMontoPagadoBs(),
                pago.getMontoPagadoUsd(),
                pago.getFechaPago(),
                deuda != null ? deuda.getNombre() : null,
                deuda != null ? deuda.getIcono() : null,
                deuda != null ? deuda.getColor() : null,
                catDto,
                deuda != null ? deuda.getId() : null,
                pago.getRegistroBotId(),
                pago.getMovimientoId(),
                pago.getOrigen()
        );
    }
}
