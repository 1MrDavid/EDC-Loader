package com.edc.api.service;

import com.edc.api.dto.ValorDolarDTO;
import com.edc.api.model.ValorDolar;

import java.util.List;

public interface ValorDolarService {
    List<ValorDolarDTO> obtenerTodos();
}
