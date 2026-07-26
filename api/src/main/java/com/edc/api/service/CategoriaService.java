package com.edc.api.service;

import java.util.List;

import com.edc.api.dto.CategoriaDTO;
import com.edc.api.dto.CategoriaResumenMesDTO;
import com.edc.api.dto.CrearCategoriaDTO;

public interface CategoriaService {
    
    CategoriaDTO crearCategoria(CrearCategoriaDTO dto);

    List<CategoriaDTO> obtenerTodas();

    List<CategoriaResumenMesDTO> obtenerResumenMensual(int month, int year);
}