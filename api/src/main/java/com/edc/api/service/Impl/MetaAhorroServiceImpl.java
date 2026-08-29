package com.edc.api.service.Impl;

import com.edc.api.dto.ActualizarMetaDTO;
import com.edc.api.dto.CrearMetaDTO;
import com.edc.api.dto.MetaAhorroDTO;
import com.edc.api.model.CuentaAhorro;
import com.edc.api.model.MetaAhorro;
import com.edc.api.repository.CuentaAhorroRepository;
import com.edc.api.repository.MetaAhorroRepository;
import com.edc.api.service.MetaAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetaAhorroServiceImpl implements MetaAhorroService {

    private final MetaAhorroRepository metaAhorroRepository;
    private final CuentaAhorroRepository cuentaAhorroRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MetaAhorroDTO> listarMetasActivas() {
        return metaAhorroRepository.findByActivaTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MetaAhorroDTO crearMeta(CrearMetaDTO dto) {
        if (dto.nombre() == null || dto.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la meta es obligatorio");
        }
        if (dto.cuentaAhorroId() == null) {
            throw new IllegalArgumentException("Debe vincular una cuenta de ahorro");
        }
        if (dto.montoObjetivoUsd() == null || dto.montoObjetivoUsd() <= 0) {
            throw new IllegalArgumentException("El monto objetivo debe ser mayor a cero");
        }

        CuentaAhorro cuenta = cuentaAhorroRepository.findById(dto.cuentaAhorroId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        MetaAhorro meta = new MetaAhorro();
        meta.setNombre(dto.nombre().trim());
        meta.setCuentaAhorro(cuenta);
        meta.setMontoObjetivoUsd(dto.montoObjetivoUsd());
        meta.setFechaLimite(dto.fechaLimite());
        meta.setActiva(true);

        return mapToDto(metaAhorroRepository.save(meta));
    }

    @Override
    @Transactional
    public MetaAhorroDTO actualizarMeta(Long id, ActualizarMetaDTO dto) {
        MetaAhorro meta = metaAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meta de ahorro no encontrada"));

        if (dto.nombre() == null || dto.nombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la meta es obligatorio");
        }
        if (dto.cuentaAhorroId() == null) {
            throw new IllegalArgumentException("Debe vincular una cuenta de ahorro");
        }
        if (dto.montoObjetivoUsd() == null || dto.montoObjetivoUsd() <= 0) {
            throw new IllegalArgumentException("El monto objetivo debe ser mayor a cero");
        }

        CuentaAhorro cuenta = cuentaAhorroRepository.findById(dto.cuentaAhorroId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        meta.setNombre(dto.nombre().trim());
        meta.setCuentaAhorro(cuenta);
        meta.setMontoObjetivoUsd(dto.montoObjetivoUsd());
        meta.setFechaLimite(dto.fechaLimite());
        if (dto.activa() != null) {
            meta.setActiva(dto.activa());
        }

        return mapToDto(metaAhorroRepository.save(meta));
    }

    @Override
    @Transactional
    public void eliminarMeta(Long id) {
        MetaAhorro meta = metaAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meta de ahorro no encontrada"));
        meta.setActiva(false);
        metaAhorroRepository.save(meta);
    }

    private MetaAhorroDTO mapToDto(MetaAhorro meta) {
        CuentaAhorro cuenta = meta.getCuentaAhorro();
        double saldoActualUsd = resolverSaldoUsd(cuenta);
        double objetivo = meta.getMontoObjetivoUsd() != null ? meta.getMontoObjetivoUsd() : 0.0;

        double porcentaje = objetivo > 0
                ? Math.min(100.0, (saldoActualUsd / objetivo) * 100.0)
                : 0.0;

        return new MetaAhorroDTO(
                meta.getId(),
                meta.getNombre(),
                cuenta != null ? cuenta.getId() : null,
                cuenta != null ? cuenta.getNombre() : null,
                meta.getMontoObjetivoUsd(),
                meta.getFechaLimite(),
                meta.getActiva(),
                redondear(saldoActualUsd),
                redondear(porcentaje),
                calcularMesesRestantes(meta.getFechaLimite(), saldoActualUsd, objetivo)
        );
    }

    private double resolverSaldoUsd(CuentaAhorro cuenta) {
        if (cuenta == null || cuenta.getSaldoActual() == null) {
            return 0.0;
        }
        // Paridad 1:1 con USD para USD/USDT; otras monedas se tratarán en el futuro
        if ("USD".equalsIgnoreCase(cuenta.getTipoMoneda()) || "USDT".equalsIgnoreCase(cuenta.getTipoMoneda())) {
            return cuenta.getSaldoActual();
        }
        return cuenta.getSaldoActual();
    }

    private Integer calcularMesesRestantes(LocalDate fechaLimite, double saldoActual, double objetivo) {
        if (fechaLimite == null) {
            return 0;
        }

        LocalDate hoy = LocalDate.now();
        if (!fechaLimite.isAfter(hoy)) {
            return 0;
        }

        long mesesHastaLimite = ChronoUnit.MONTHS.between(hoy.withDayOfMonth(1), fechaLimite.withDayOfMonth(1));
        if (mesesHastaLimite <= 0) {
            return 0;
        }

        if (saldoActual >= objetivo) {
            return 0;
        }

        return (int) mesesHastaLimite;
    }

    private double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
