package com.edc.api.service;

import java.util.List;

import com.edc.api.dto.ActualizarDeudaDTO;
import com.edc.api.dto.CrearDeudaDTO;
import com.edc.api.dto.DeudaDTO;
import com.edc.api.dto.PagoDeudaDTO;

public interface DeudaService {
    List<DeudaDTO> obtenerDeudasActivas(Integer month, Integer year);

    DeudaDTO crearDeuda(CrearDeudaDTO dto);

    DeudaDTO actualizarDeuda(Long id, ActualizarDeudaDTO dto);

    List<PagoDeudaDTO> obtenerPagosPorPeriodo(int month, int year);
}
