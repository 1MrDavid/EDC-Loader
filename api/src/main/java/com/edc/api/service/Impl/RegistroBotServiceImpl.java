package com.edc.api.service.Impl;

import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.mapper.RegistroBotMapper;
import com.edc.api.model.Categoria;
import com.edc.api.model.RegistroBot;
import com.edc.api.repository.CategoriaRepository;
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
    private final CategoriaRepository categoriaRepository;

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

    @Override
    @Transactional
    public RegistroBotDTO actualizarRegistro(Long id, RegistroBotDTO dto) {
        RegistroBot registro = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        registro.setMonto(dto.monto());
        registro.setReferencia(dto.referencia());
        registro.setBancoOrigen(dto.bancoOrigen());
        registro.setBancoDestino(dto.bancoDestino());
        registro.setBeneficiario(dto.beneficiario());
        registro.setTelefono(dto.telefono());
        registro.setIdentificacion(dto.identificacion());
        registro.setConcepto(dto.concepto());
        registro.setEsIngreso(dto.esIngreso());
        
        if (dto.categoria() != null && dto.categoria().id() != null) {
            Categoria cat = categoriaRepository.findById(dto.categoria().id()).orElse(null);
            registro.setCategoria(cat);
        } else {
            registro.setCategoria(null);
        }

        return mapper.toDto(repository.save(registro));
    }
}