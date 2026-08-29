package com.edc.api.service;

import com.edc.api.dto.CrearMovimientoAhorroDTO;
import com.edc.api.dto.MovimientoAhorroDTO;

import java.util.List;

public interface MovimientoAhorroService {

    List<MovimientoAhorroDTO> obtenerPorCuenta(Long cuentaAhorroId);

    MovimientoAhorroDTO registrar(CrearMovimientoAhorroDTO dto);

    void eliminar(Long id);
}
