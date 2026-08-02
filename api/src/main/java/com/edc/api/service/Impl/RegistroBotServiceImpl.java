package com.edc.api.service.Impl;

import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.mapper.RegistroBotMapper;
import com.edc.api.model.RegistroBot;
import com.edc.api.repository.RegistroBotRepository;
import com.edc.api.service.RegistroBotService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RegistroBotServiceImpl implements RegistroBotService {

    private final RegistroBotRepository repository;
    private final RegistroBotMapper mapper;

    @Override
    public List<RegistroBotDTO> obtenerPendientes() {
        return repository.findByProcesadoFalseOrderByFechaCreacionDesc()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void marcarComoProcesadoManual(Long id) {
        RegistroBot registro = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        registro.setProcesado(true);
        repository.save(registro);
    }
}