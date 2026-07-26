package com.edc.api.service;

import com.edc.api.dto.CrearReglaDTO;
import com.edc.api.dto.ReglaDTO;

public interface ReglaCategorizacionService {
    ReglaDTO crearRegla(CrearReglaDTO dto);
}