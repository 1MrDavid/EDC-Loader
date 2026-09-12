package com.edc.api.service;

import com.edc.api.dto.CrearRegistroBotDTO;
import com.edc.api.dto.RegistroBotDTO;
import java.util.List;

public interface RegistroBotService {
    List<RegistroBotDTO> obtenerPendientes();
    void marcarComoProcesadoManual(Long id);
    RegistroBotDTO actualizarRegistro(Long id, RegistroBotDTO dto);
    RegistroBotDTO crearRegistro(CrearRegistroBotDTO dto);
    int forzarConciliacionGlobal();
}