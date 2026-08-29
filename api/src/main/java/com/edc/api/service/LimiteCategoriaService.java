package com.edc.api.service;

import com.edc.api.dto.ActualizarLimiteDTO;
import com.edc.api.dto.CrearLimiteDTO;
import com.edc.api.dto.LimiteCategoriaDTO;

import java.util.List;

public interface LimiteCategoriaService {

    List<LimiteCategoriaDTO> obtenerLimites(int mes, int ano);

    LimiteCategoriaDTO crearLimite(CrearLimiteDTO dto);

    LimiteCategoriaDTO actualizarLimite(Long id, ActualizarLimiteDTO dto);

    void eliminarLimite(Long id);
}
