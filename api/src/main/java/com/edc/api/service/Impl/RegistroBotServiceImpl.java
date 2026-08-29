package com.edc.api.service.Impl;

import com.edc.api.dto.PagoDeudaDTO;
import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.mapper.RegistroBotMapper;
import com.edc.api.model.Categoria;
import com.edc.api.model.RegistroBot;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.RegistroBotRepository;
import com.edc.api.service.PagoDeudaService;
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
    private final PagoDeudaService pagoDeudaService;

    @Override
    public List<RegistroBotDTO> obtenerPendientes() {
        return repository.findByProcesadoFalseOrderByFechaCreacionDesc()
                .stream()
                .map(this::toDtoConPago)
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

        Long categoriaAnterior = registro.getCategoria() != null ? registro.getCategoria().getId() : null;

        registro.setMonto(dto.monto());
        registro.setReferencia(dto.referencia());
        registro.setBancoOrigen(dto.bancoOrigen());
        registro.setBancoDestino(dto.bancoDestino());
        registro.setBeneficiario(dto.beneficiario());
        registro.setTelefono(dto.telefono());
        registro.setIdentificacion(dto.identificacion());
        registro.setConcepto(dto.concepto());
        registro.setEsIngreso(dto.esIngreso());
        if (dto.fecha() != null) {
            registro.setFecha(dto.fecha());
        }

        Long categoriaNueva = null;
        if (dto.categoria() != null && dto.categoria().id() != null) {
            Categoria cat = categoriaRepository.findById(dto.categoria().id()).orElse(null);
            registro.setCategoria(cat);
            categoriaNueva = cat != null ? cat.getId() : null;
        } else {
            registro.setCategoria(null);
        }

        if (categoriaAnterior != null && !categoriaAnterior.equals(categoriaNueva)) {
            pagoDeudaService.revertirPagosAutoPorRegistroBot(id);
        }

        RegistroBot guardado = repository.save(registro);

        if (categoriaNueva != null) {
            pagoDeudaService.intentarAutoMatch(
                    categoriaNueva,
                    guardado.getFecha(),
                    guardado.getMonto(),
                    guardado.getMontoDolar(),
                    guardado.getEsIngreso(),
                    guardado.getId(),
                    null
            );
        }

        return toDtoConPago(guardado);
    }

    private RegistroBotDTO toDtoConPago(RegistroBot entity) {
        PagoDeudaDTO pago = pagoDeudaService.obtenerPorRegistroBot(entity.getId()).orElse(null);
        return mapper.toDto(entity, pago);
    }
}
