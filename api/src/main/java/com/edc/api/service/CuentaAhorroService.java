package com.edc.api.service;

import com.edc.api.dto.ActualizarCuentaAhorroDTO;
import com.edc.api.dto.CrearCuentaAhorroDTO;
import com.edc.api.dto.CuentaAhorroDTO;

import java.util.List;

public interface CuentaAhorroService {

    List<CuentaAhorroDTO> obtenerCuentasAhorro();

    CuentaAhorroDTO obtenerPorId(Long id);

    CuentaAhorroDTO crearCuenta(CrearCuentaAhorroDTO dto);

    CuentaAhorroDTO actualizarCuenta(Long id, ActualizarCuentaAhorroDTO dto);

    void eliminarCuenta(Long id);
}
