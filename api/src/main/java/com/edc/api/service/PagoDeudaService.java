package com.edc.api.service;

import com.edc.api.dto.PagoDeudaDTO;
import com.edc.api.dto.RegistrarPagoDeudaDTO;

import java.util.Optional;

public interface PagoDeudaService {

    PagoDeudaDTO registrarPago(RegistrarPagoDeudaDTO dto);

    void eliminarPago(Long id);

    Optional<PagoDeudaDTO> intentarAutoMatch(
            Long categoriaId,
            java.time.LocalDate fecha,
            Double montoBs,
            Double montoUsd,
            Boolean esIngreso,
            Long registroBotId,
            Long movimientoId
    );

    void revertirPagosAutoPorRegistroBot(Long registroBotId);

    void autoMatchRegistrosBotPorCategoria(Long categoriaId);

    Optional<PagoDeudaDTO> obtenerPorRegistroBot(Long registroBotId);
}
