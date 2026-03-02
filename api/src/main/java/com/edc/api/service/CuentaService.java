package com.edc.api.service;

import com.edc.api.dto.CrearCuentaDTO;
import com.edc.api.dto.CuentaDTO;

import java.util.List;

public interface CuentaService {
    public List<CuentaDTO> obtenerTodas();

    public CuentaDTO crearCuenta(CrearCuentaDTO dto);
}
