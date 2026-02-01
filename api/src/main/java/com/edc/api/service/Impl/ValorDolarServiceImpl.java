package com.edc.api.service.Impl;

import com.edc.api.dto.ValorDolarDTO;
import com.edc.api.mapper.ValorDolarMapper;
import com.edc.api.repository.ValorDolarRepository;
import com.edc.api.service.ValorDolarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ValorDolarServiceImpl implements ValorDolarService {

    private final ValorDolarRepository repository;
    private final ValorDolarMapper mapper;

    @Override
    public List<ValorDolarDTO> obtenerTodos() {
        return repository.findAllByOrderByAnoAscMesAscDiaAsc()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
