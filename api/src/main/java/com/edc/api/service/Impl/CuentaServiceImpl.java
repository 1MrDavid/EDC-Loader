package com.edc.api.service.Impl;

import com.edc.api.dto.CuentaDTO;
import com.edc.api.mapper.CuentaMapper;
import com.edc.api.repository.CuentaRepository;
import com.edc.api.service.CuentaService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CuentaServiceImpl implements CuentaService {
    private final CuentaRepository repository;
    private final CuentaMapper mapper;

    @Override
    public List<CuentaDTO> obtenerTodas() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
