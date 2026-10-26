package com.edc.api.service;

import com.edc.api.dto.ValorDolarDTO;

import java.util.List;

public interface ValorDolarService {
    List<ValorDolarDTO> obtenerTodos(Integer year);

    List<Integer> obtenerAnios();
}
