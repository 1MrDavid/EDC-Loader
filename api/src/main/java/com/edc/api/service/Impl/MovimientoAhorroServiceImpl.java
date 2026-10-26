package com.edc.api.service.Impl;

import com.edc.api.dto.CrearMovimientoAhorroDTO;
import com.edc.api.dto.MovimientoAhorroDTO;
import com.edc.api.model.Categoria;
import com.edc.api.model.CuentaAhorro;
import com.edc.api.model.Deuda;
import com.edc.api.model.MovimientoAhorro;
import com.edc.api.model.PagoDeuda;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.CuentaAhorroRepository;
import com.edc.api.repository.DeudaRepository;
import com.edc.api.repository.MovimientoAhorroRepository;
import com.edc.api.repository.PagoDeudaRepository;
import com.edc.api.repository.ValorDolarRepository;
import com.edc.api.service.MovimientoAhorroService;
import com.edc.api.util.PeriodoDeudaUtil;
import com.edc.api.util.PeriodoDeudaUtil.Periodo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovimientoAhorroServiceImpl implements MovimientoAhorroService {

    private final MovimientoAhorroRepository movimientoAhorroRepository;
    private final CuentaAhorroRepository cuentaAhorroRepository;
    private final CategoriaRepository categoriaRepository;
    private final DeudaRepository deudaRepository;
    private final PagoDeudaRepository pagoDeudaRepository;
    private final ValorDolarRepository valorDolarRepository;

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
            throw new IllegalArgumentException("Saldo insuficiente en la billetera");
        }

        MovimientoAhorro movimiento = new MovimientoAhorro();
        movimiento.setCuentaAhorroId(cuenta.getId());
        movimiento.setTipoOperacion(tipo);
        movimiento.setMonto(dto.monto());
        movimiento.setDescripcion(dto.descripcion());
        movimiento.setFecha(fecha);
        movimiento.setCategoria(resolverCategoria(dto.categoriaId()));
        movimiento.setDeuda(resolverDeuda(dto.deudaId()));

        cuenta.setSaldoActual(nuevoSaldo);
        cuentaAhorroRepository.save(cuenta);

        MovimientoAhorro guardado = movimientoAhorroRepository.save(movimiento);
        if (dto.deudaId() == null) {
            sincronizarPagoDeuda(guardado, cuenta);
            guardado = movimientoAhorroRepository.save(guardado);
        }
        return mapToDto(guardado);
    }

    @Override
    @Transactional
    public MovimientoAhorroDTO actualizar(Long id, CrearMovimientoAhorroDTO dto) {
        MovimientoAhorro movimiento = movimientoAhorroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento de ahorro no encontrado"));

        CuentaAhorro cuenta = cuentaAhorroRepository.findById(movimiento.getCuentaAhorroId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de ahorro no encontrada"));

        String nuevoTipo = normalizarTipoOperacion(dto.tipoOperacion());
        if (dto.monto() == null || dto.monto() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        double saldoActual = cuenta.getSaldoActual() != null ? cuenta.getSaldoActual() : 0.0;
        String tipoReverso = "INGRESO".equals(movimiento.getTipoOperacion()) ? "EGRESO" : "INGRESO";
        double saldoSinMovimiento = calcularNuevoSaldo(saldoActual, tipoReverso, movimiento.getMonto());
        double nuevoSaldo = calcularNuevoSaldo(saldoSinMovimiento, nuevoTipo, dto.monto());

        if (nuevoSaldo < 0) {
            throw new IllegalArgumentException("Saldo insuficiente en la billetera");
        }

        movimiento.setTipoOperacion(nuevoTipo);
        movimiento.setMonto(dto.monto());
        movimiento.setDescripcion(dto.descripcion());
        movimiento.setFecha(dto.fecha() != null ? dto.fecha() : movimiento.getFecha());
        movimiento.setCategoria(resolverCategoria(dto.categoriaId()));
        if (dto.deudaId() != null) {
            movimiento.setDeuda(resolverDeuda(dto.deudaId()));
        }

        cuenta.setSaldoActual(nuevoSaldo);
        cuentaAhorroRepository.save(cuenta);

        MovimientoAhorro guardado = movimientoAhorroRepository.save(movimiento);
        sincronizarPagoDeuda(guardado, cuenta);
        return mapToDto(movimientoAhorroRepository.save(guardado));
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
        pagoDeudaRepository.findByMovimientoAhorroId(id).ifPresent(this::eliminarPagoSinRevertirBilletera);
        movimientoAhorroRepository.delete(movimiento);
    }

    private void sincronizarPagoDeuda(MovimientoAhorro movimiento, CuentaAhorro cuenta) {
        Optional<PagoDeuda> pagoExistente = pagoDeudaRepository.findByMovimientoAhorroId(movimiento.getId());
        boolean esEgreso = "EGRESO".equalsIgnoreCase(movimiento.getTipoOperacion());
        Categoria categoria = movimiento.getCategoria();

        if (!esEgreso || categoria == null) {
            pagoExistente.ifPresent(this::eliminarPagoSinRevertirBilletera);
            movimiento.setDeuda(null);
            return;
        }

        Optional<Deuda> deudaOpt = deudaRepository.findByActivaTrueAndCategoriaId(categoria.getId());
        if (deudaOpt.isEmpty() && pagoExistente.isPresent() && pagoExistente.get().getDeuda() != null) {
            deudaOpt = Optional.of(pagoExistente.get().getDeuda());
        }
        if (deudaOpt.isEmpty()) {
            pagoExistente.ifPresent(this::eliminarPagoSinRevertirBilletera);
            movimiento.setDeuda(null);
            return;
        }

        Deuda deuda = deudaOpt.get();
        double[] montos = convertirMontos(cuenta, movimiento.getMonto());

        if (pagoExistente.isPresent()) {
            PagoDeuda pago = pagoExistente.get();
            boolean mismaDeuda = pago.getDeuda() != null && pago.getDeuda().getId().equals(deuda.getId());
            if (!mismaDeuda && !periodoDisponibleParaNuevoPago(deuda, movimiento.getFecha())) {
                eliminarPagoSinRevertirBilletera(pago);
                movimiento.setDeuda(null);
                return;
            }
            pago.setDeuda(deuda);
            pago.setFechaPago(movimiento.getFecha());
            pago.setMontoPagadoBs(montos[0]);
            pago.setMontoPagadoUsd(montos[1]);
            pago.setOrigen("BILLETERA");
            pagoDeudaRepository.save(pago);
            movimiento.setDeuda(deuda);
            return;
        }

        if (!periodoDisponibleParaNuevoPago(deuda, movimiento.getFecha())) {
            return;
        }

        PagoDeuda pago = new PagoDeuda();
        pago.setDeuda(deuda);
        pago.setFechaPago(movimiento.getFecha());
        pago.setMontoPagadoBs(montos[0]);
        pago.setMontoPagadoUsd(montos[1]);
        pago.setOrigen("BILLETERA");
        pago.setMovimientoAhorroId(movimiento.getId());
        pagoDeudaRepository.save(pago);
        movimiento.setDeuda(deuda);

        if ("UNA_VEZ".equalsIgnoreCase(deuda.getFrecuencia())) {
            deuda.setActiva(false);
            deudaRepository.save(deuda);
        }

        log.info("Auto-pago billetera: movimiento {} → deuda '{}'", movimiento.getId(), deuda.getNombre());
    }

    private boolean periodoDisponibleParaNuevoPago(Deuda deuda, LocalDate fecha) {
        Periodo periodo = PeriodoDeudaUtil.calcularPeriodo(deuda, fecha);
        boolean yaPagada = pagoDeudaRepository.existsByDeudaIdAndFechaPagoBetween(
                deuda.getId(), periodo.inicio(), periodo.fin());
        return PeriodoDeudaUtil.esDeudaCiclicaPendienteEnPeriodo(deuda, fecha, yaPagada);
    }

    private void eliminarPagoSinRevertirBilletera(PagoDeuda pago) {
        Deuda deuda = pago.getDeuda();
        pagoDeudaRepository.delete(pago);
        if (deuda != null && "UNA_VEZ".equalsIgnoreCase(deuda.getFrecuencia())) {
            deuda.setActiva(true);
            deudaRepository.save(deuda);
        }
    }

    private double[] convertirMontos(CuentaAhorro cuenta, double monto) {
        Double tasaDolar = valorDolarRepository.obtenerTasaMasReciente();
        double tasa = (tasaDolar != null && tasaDolar > 0) ? tasaDolar : 1.0;
        String moneda = cuenta.getTipoMoneda();
        boolean esUsd = moneda != null && (
                moneda.equalsIgnoreCase("USD") || moneda.equalsIgnoreCase("USDT"));
        if (esUsd) {
            return new double[]{redondear(monto * tasa), redondear(monto)};
        }
        return new double[]{redondear(monto), redondear(monto / tasa)};
    }

    private Categoria resolverCategoria(Long categoriaId) {
        if (categoriaId == null) {
            return null;
        }
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
    }

    private Deuda resolverDeuda(Long deudaId) {
        if (deudaId == null) {
            return null;
        }
        return deudaRepository.findById(deudaId)
                .orElseThrow(() -> new IllegalArgumentException("Deuda no encontrada"));
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

    private double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    private MovimientoAhorroDTO mapToDto(MovimientoAhorro movimiento) {
        Categoria categoria = movimiento.getCategoria();
        Deuda deuda = movimiento.getDeuda();
        if (deuda == null) {
            deuda = pagoDeudaRepository.findByMovimientoAhorroId(movimiento.getId())
                    .map(PagoDeuda::getDeuda)
                    .orElse(null);
        }
        return new MovimientoAhorroDTO(
                movimiento.getId(),
                movimiento.getCuentaAhorroId(),
                movimiento.getTipoOperacion(),
                movimiento.getMonto(),
                movimiento.getDescripcion(),
                movimiento.getFecha(),
                movimiento.getMovimientoId(),
                movimiento.getRegistroBotId(),
                categoria != null ? categoria.getId() : null,
                categoria != null ? categoria.getNombre() : null,
                categoria != null ? categoria.getColor() : null,
                categoria != null ? categoria.getIcono() : null,
                deuda != null ? deuda.getId() : null,
                deuda != null ? deuda.getNombre() : null
        );
    }
}
