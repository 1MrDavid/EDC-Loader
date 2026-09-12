package com.edc.api.service.Impl;

import com.edc.api.dto.ActualizarDeudaDTO;
import com.edc.api.dto.CategoriaResumenDTO;
import com.edc.api.dto.CrearDeudaDTO;
import com.edc.api.dto.DeudaDTO;
import com.edc.api.dto.PagoDeudaDTO;
import com.edc.api.model.Categoria;
import com.edc.api.model.Deuda;
import com.edc.api.model.Frecuencia;
import com.edc.api.model.PagoDeuda;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.DeudaRepository;
import com.edc.api.repository.PagoDeudaRepository;
import com.edc.api.repository.ValorDolarRepository;
import com.edc.api.service.DeudaService;
import com.edc.api.util.PeriodoDeudaUtil;
import com.edc.api.util.PeriodoDeudaUtil.Periodo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeudaServiceImpl implements DeudaService {

    private final DeudaRepository deudaRepository;
    private final PagoDeudaRepository pagoDeudaRepository;
    private final ValorDolarRepository valorDolarRepository;
    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DeudaDTO> obtenerDeudasActivas(Integer month, Integer year) {
        LocalDate referencia = resolverFechaReferencia(month, year);
        List<Deuda> deudas = deudaRepository.findByActivaTrue();
        double tasa = obtenerTasaDolar();

        return deudas.stream()
                .map(deuda -> mapToDeudaDTO(deuda, tasa, referencia))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeudaDTO crearDeuda(CrearDeudaDTO dto) {
        Long categoriaId = resolverCategoriaId(dto);

        Deuda deuda = new Deuda();
        aplicarCamposDeuda(
                deuda,
                dto.nombre(),
                dto.tipoDeuda(),
                dto.frecuencia(),
                dto.montoBs(),
                dto.montoUsd(),
                dto.montoEur(),
                categoriaId,
                dto.fechaInicio() != null ? dto.fechaInicio() : LocalDate.now(),
                dto.fechaFin(),
                dto.color() != null ? dto.color() : "#64748b",
                dto.icono() != null ? dto.icono() : "💳",
                dto.cuotasTotales(),
                true,
                null
        );

        Deuda guardada = deudaRepository.save(deuda);
        return mapToDeudaDTO(guardada, obtenerTasaDolar(), LocalDate.now());
    }

    @Override
    @Transactional
    public DeudaDTO actualizarDeuda(Long id, ActualizarDeudaDTO dto) {
        Deuda deuda = deudaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deuda no encontrada"));

        Long categoriaId = dto.categoriaId();
        if (categoriaId == null) {
            throw new IllegalArgumentException("La categoría es obligatoria para una deuda activa");
        }

        aplicarCamposDeuda(
                deuda,
                dto.nombre(),
                dto.tipoDeuda(),
                dto.frecuencia(),
                dto.montoBs(),
                dto.montoUsd(),
                dto.montoEur(),
                categoriaId,
                dto.fechaInicio(),
                dto.fechaFin(),
                dto.color(),
                dto.icono(),
                dto.cuotasTotales(),
                dto.activa() != null ? dto.activa() : deuda.getActiva(),
                id
        );

        Deuda guardada = deudaRepository.save(deuda);
        return mapToDeudaDTO(guardada, obtenerTasaDolar(), LocalDate.now());
    }

    private Long resolverCategoriaId(CrearDeudaDTO dto) {
        if (Boolean.TRUE.equals(dto.crearCategoriaDedicada())) {
            Categoria categoria = new Categoria();
            categoria.setNombre(dto.nombre());
            categoria.setTipo("EGRESO");
            categoria.setColor(dto.color() != null ? dto.color() : "#64748b");
            categoria.setIcono(dto.icono() != null ? dto.icono() : "💳");
            categoria.setActiva(true);
            Categoria guardada = categoriaRepository.save(categoria);
            validarCategoriaUnica(guardada.getId(), null);
            return guardada.getId();
        }

        if (dto.categoriaId() == null) {
            throw new IllegalArgumentException("Debe seleccionar una categoría o crear una dedicada");
        }
        validarCategoriaUnica(dto.categoriaId(), null);
        return dto.categoriaId();
    }

    private void validarCategoriaUnica(Long categoriaId, Long deudaIdExcluir) {
        boolean existe = deudaIdExcluir == null
                ? deudaRepository.existsByActivaTrueAndCategoriaId(categoriaId)
                : deudaRepository.existsByActivaTrueAndCategoriaIdAndIdNot(categoriaId, deudaIdExcluir);
        if (existe) {
            throw new IllegalArgumentException("Ya existe una deuda activa con esta categoría");
        }
    }

    private void aplicarCamposDeuda(
            Deuda deuda,
            String nombre,
            String tipoDeuda,
            String frecuencia,
            Double montoBs,
            Double montoUsd,
            Double montoEur,
            Long categoriaId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String color,
            String icono,
            Integer cuotasTotales,
            Boolean activa,
            Long deudaIdExcluir
    ) {
        if (Boolean.TRUE.equals(activa) && categoriaId != null) {
            validarCategoriaUnica(categoriaId, deudaIdExcluir);
        }

        deuda.setNombre(nombre);
        deuda.setTipoDeuda(tipoDeuda.toUpperCase());
        deuda.setFrecuencia(Frecuencia.from(frecuencia).name());
        deuda.setMontoBs(montoBs);
        deuda.setMontoUsd(montoUsd);
        deuda.setMontoEur(montoEur);
        deuda.setFechaInicio(fechaInicio);
        deuda.setFechaFin(fechaFin);
        deuda.setColor(color);
        deuda.setIcono(icono);
        deuda.setCuotasTotales(cuotasTotales);
        deuda.setActiva(activa);

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        deuda.setCategoria(categoria);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoDeudaDTO> obtenerPagosPorPeriodo(int month, int year) {
        LocalDate inicio = LocalDate.of(year, month, 1);
        LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());

        return pagoDeudaRepository.findByFechaPagoBetween(inicio, fin).stream()
                .map(this::mapToPagoDeudaDTO)
                .collect(Collectors.toList());
    }

    private PagoDeudaDTO mapToPagoDeudaDTO(PagoDeuda pago) {
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

    private DeudaDTO mapToDeudaDTO(Deuda deuda, double tasa, LocalDate referencia) {
        double equivBs = 0.0;
        double equivUsd = 0.0;

        if (deuda.getMontoUsd() != null) {
            equivUsd = deuda.getMontoUsd();
            equivBs = deuda.getMontoUsd() * tasa;
        } else if (deuda.getMontoBs() != null) {
            equivBs = deuda.getMontoBs();
            equivUsd = deuda.getMontoBs() / tasa;
        }

        boolean pagado = verificarSiEstaPagado(deuda, referencia);

        CategoriaResumenDTO catDto = deuda.getCategoria() != null ?
                new CategoriaResumenDTO(
                        deuda.getCategoria().getId(),
                        deuda.getCategoria().getNombre(),
                        deuda.getCategoria().getColor(),
                        deuda.getCategoria().getIcono()
                ) : null;

        double abonadoBs = 0.0;
        double abonadoUsd = 0.0;
        int cuotasPagadas = 0;

        if ("DEFINIDA".equalsIgnoreCase(deuda.getTipoDeuda())) {
            List<PagoDeuda> historialPagos = pagoDeudaRepository.findByDeudaId(deuda.getId());
            cuotasPagadas = historialPagos.size();
            for (PagoDeuda pago : historialPagos) {
                abonadoBs += pago.getMontoPagadoBs() != null ? pago.getMontoPagadoBs() : 0.0;
                abonadoUsd += pago.getMontoPagadoUsd() != null ? pago.getMontoPagadoUsd() : 0.0;
            }
        }

        return new DeudaDTO(
                deuda.getId(), deuda.getNombre(), deuda.getTipoDeuda(), deuda.getFrecuencia(),
                deuda.getMontoBs(), deuda.getMontoUsd(), deuda.getMontoEur(),
                Math.round(equivBs * 100.0) / 100.0,
                Math.round(equivUsd * 100.0) / 100.0,
                pagado, catDto, deuda.getFechaInicio(), deuda.getFechaFin(),
                deuda.getActiva(), deuda.getColor(), deuda.getIcono(),
                deuda.getCuotasTotales(), cuotasPagadas,
                Math.round(abonadoBs * 100.0) / 100.0,
                Math.round(abonadoUsd * 100.0) / 100.0
        );
    }

    private LocalDate resolverFechaReferencia(Integer month, Integer year) {
        if (month != null && year != null) {
            return LocalDate.of(year, month, 15);
        }
        return LocalDate.now();
    }

    private double obtenerTasaDolar() {
        Double tasaDolar = valorDolarRepository.obtenerTasaMasReciente();
        return (tasaDolar != null && tasaDolar > 0) ? tasaDolar : 1.0;
    }

    private boolean verificarSiEstaPagado(Deuda deuda, LocalDate referencia) {
        if ("UNA_VEZ".equalsIgnoreCase(deuda.getFrecuencia())) {
            return pagoDeudaRepository.findByDeudaId(deuda.getId()).size() > 0 || !Boolean.TRUE.equals(deuda.getActiva());
        }

        Periodo periodo = PeriodoDeudaUtil.calcularPeriodo(deuda, referencia);
        return pagoDeudaRepository.existsByDeudaIdAndFechaPagoBetween(deuda.getId(), periodo.inicio(), periodo.fin());
    }
}
