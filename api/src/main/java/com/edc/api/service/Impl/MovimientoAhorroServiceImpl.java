package com.edc.api.service.Impl;

import com.edc.api.dto.CrearMovimientoAhorroDTO;
import com.edc.api.dto.MovimientoAhorroDTO;
import com.edc.api.model.CuentaAhorro;
import com.edc.api.model.MovimientoAhorro;
import com.edc.api.repository.CuentaAhorroRepository;
import com.edc.api.repository.MovimientoAhorroRepository;
import com.edc.api.service.MovimientoAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoAhorroServiceImpl implements MovimientoAhorroService {

    private final MovimientoAhorroRepository movimientoAhorroRepository;
    private final CuentaAhorroRepository cuentaAhorroRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoAhorroDTO> obtenerPorCuenta(Long cuentaAhorroId) {
        if (!cuentaAhorroRepository.existsById(cuentaAhorroId)) {
            throw new IllegalArgumentException("Cuenta de ahorro no encontrada");
        }

        return movimientoAhorroRepository.findByCuentaAhorroIdOrderByFechaDescIdDesc(cuentaAhorroId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MovimientoAhorroDTO registrar(CrearMovimientoAhorroDTO dto) {
        CuentaAhorro cuenta = cuentaAhorroRepository.findById(dto.cuentaAhorroId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        String tipo = normalizarTipoOperacion(dto.tipoOperacion());
        if (dto.monto() == null || dto.monto() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        LocalDate fecha = dto.fecha() != null ? dto.fecha() : LocalDate.now();
        double saldoActual = cuenta.getSaldoActual() != null ? cuenta.getSaldoActual() : 0.0;
        double nuevoSaldo = calcularNuevoSaldo(saldoActual, tipo, dto.monto());

        if (nuevoSaldo < 0) {
            throw new IllegalArgumentException("Saldo insuficiente en la cuenta de ahorro");
        }

        MovimientoAhorro movimiento = new MovimientoAhorro();
        movimiento.setCuentaAhorroId(cuenta.getId());
        movimiento.setTipoOperacion(tipo);
        movimiento.setMonto(dto.monto());
        movimiento.setDescripcion(dto.descripcion());
        movimiento.setFecha(fecha);

        cuenta.setSaldoActual(nuevoSaldo);
        cuentaAhorroRepository.save(cuenta);

        return mapToDto(movimientoAhorroRepository.save(movimiento));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        MovimientoAhorro movimiento = movimientoAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento de ahorro no encontrado"));

        CuentaAhorro cuenta = cuentaAhorroRepository.findById(movimiento.getCuentaAhorroId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        double saldoActual = cuenta.getSaldoActual() != null ? cuenta.getSaldoActual() : 0.0;
        String tipoReverso = "INGRESO".equals(movimiento.getTipoOperacion()) ? "EGRESO" : "INGRESO";
        double nuevoSaldo = calcularNuevoSaldo(saldoActual, tipoReverso, movimiento.getMonto());

        cuenta.setSaldoActual(nuevoSaldo);
        cuentaAhorroRepository.save(cuenta);
        movimientoAhorroRepository.delete(movimiento);
    }

    private double calcularNuevoSaldo(double saldoActual, String tipo, double monto) {
        if ("INGRESO".equals(tipo)) {
            return saldoActual + monto;
        }
        return saldoActual - monto;
    }

    private String normalizarTipoOperacion(String tipo) {
        if (tipo == null) {
            throw new IllegalArgumentException("El tipo de operación es obligatorio");
        }
        String normalizado = tipo.trim().toUpperCase();
        if (!"INGRESO".equals(normalizado) && !"EGRESO".equals(normalizado)) {
            throw new IllegalArgumentException("Tipo de operación inválido. Use INGRESO o EGRESO");
        }
        return normalizado;
    }

    private MovimientoAhorroDTO mapToDto(MovimientoAhorro movimiento) {
        return new MovimientoAhorroDTO(
                movimiento.getId(),
                movimiento.getCuentaAhorroId(),
                movimiento.getTipoOperacion(),
                movimiento.getMonto(),
                movimiento.getDescripcion(),
                movimiento.getFecha(),
                movimiento.getMovimientoId(),
                movimiento.getRegistroBotId()
        );
    }
}
