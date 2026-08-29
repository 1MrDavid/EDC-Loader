package com.edc.api.service.Impl;

import com.edc.api.dto.ActualizarCuentaAhorroDTO;
import com.edc.api.dto.CrearCuentaAhorroDTO;
import com.edc.api.dto.CuentaAhorroDTO;
import com.edc.api.model.CuentaAhorro;
import com.edc.api.repository.CuentaAhorroRepository;
import com.edc.api.repository.MetaAhorroRepository;
import com.edc.api.repository.MovimientoAhorroRepository;
import com.edc.api.repository.ValorDolarRepository;
import com.edc.api.service.CuentaAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuentaAhorroServiceImpl implements CuentaAhorroService {

    private final CuentaAhorroRepository cuentaAhorroRepository;
    private final MovimientoAhorroRepository movimientoAhorroRepository;
    private final MetaAhorroRepository metaAhorroRepository;
    private final ValorDolarRepository valorDolarRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CuentaAhorroDTO> obtenerCuentasAhorro() {
        return cuentaAhorroRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CuentaAhorroDTO obtenerPorId(Long id) {
        CuentaAhorro cuenta = cuentaAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));
        return mapToDto(cuenta);
    }

    @Override
    @Transactional
    public CuentaAhorroDTO crearCuenta(CrearCuentaAhorroDTO dto) {
        validarNombre(dto.nombre());
        validarTipoMoneda(dto.tipoMoneda());

        CuentaAhorro cuenta = new CuentaAhorro();
        cuenta.setNombre(dto.nombre().trim());
        cuenta.setTipoMoneda(dto.tipoMoneda().trim().toUpperCase());
        cuenta.setSaldoActual(dto.saldoInicial() != null ? dto.saldoInicial() : 0.0);
        cuenta.setColor(dto.color() != null ? dto.color() : "#64748b");
        cuenta.setIcono(dto.icono() != null ? dto.icono() : "💰");

        return mapToDto(cuentaAhorroRepository.save(cuenta));
    }

    @Override
    @Transactional
    public CuentaAhorroDTO actualizarCuenta(Long id, ActualizarCuentaAhorroDTO dto) {
        CuentaAhorro cuenta = cuentaAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        validarNombre(dto.nombre());
        validarTipoMoneda(dto.tipoMoneda());

        cuenta.setNombre(dto.nombre().trim());
        cuenta.setTipoMoneda(dto.tipoMoneda().trim().toUpperCase());
        cuenta.setColor(dto.color() != null ? dto.color() : cuenta.getColor());
        cuenta.setIcono(dto.icono() != null ? dto.icono() : cuenta.getIcono());

        return mapToDto(cuentaAhorroRepository.save(cuenta));
    }

    @Override
    @Transactional
    public void eliminarCuenta(Long id) {
        if (!cuentaAhorroRepository.existsById(id)) {
            throw new IllegalArgumentException("Cuenta de ahorro no encontrada");
        }
        if (metaAhorroRepository.existsByCuentaAhorro_Id(id)) {
            throw new IllegalArgumentException("No se puede eliminar: la cuenta tiene metas de ahorro vinculadas");
        }

        movimientoAhorroRepository.deleteByCuentaAhorroId(id);
        cuentaAhorroRepository.deleteById(id);
    }

    private CuentaAhorroDTO mapToDto(CuentaAhorro cuenta) {
        Double tasaDolar = valorDolarRepository.obtenerTasaMasReciente();
        final double tasa = (tasaDolar != null && tasaDolar > 0) ? tasaDolar : 1.0;

        double saldo = cuenta.getSaldoActual() != null ? cuenta.getSaldoActual() : 0.0;
        double equivBs = 0.0;
        double equivUsd = 0.0;

        if ("USD".equalsIgnoreCase(cuenta.getTipoMoneda()) || "USDT".equalsIgnoreCase(cuenta.getTipoMoneda())) {
            equivUsd = saldo;
            equivBs = saldo * tasa;
        } else if ("Bs".equalsIgnoreCase(cuenta.getTipoMoneda()) || "VES".equalsIgnoreCase(cuenta.getTipoMoneda())) {
            equivBs = saldo;
            equivUsd = saldo / tasa;
        } else {
            equivUsd = saldo;
            equivBs = saldo * tasa;
        }

        return new CuentaAhorroDTO(
                cuenta.getId(),
                cuenta.getNombre(),
                cuenta.getTipoMoneda(),
                saldo,
                redondear(equivBs),
                redondear(equivUsd),
                cuenta.getColor(),
                cuenta.getIcono()
        );
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
    }

    private void validarTipoMoneda(String tipoMoneda) {
        if (tipoMoneda == null || tipoMoneda.isBlank()) {
            throw new IllegalArgumentException("El tipo de moneda es obligatorio");
        }
    }

    private double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
