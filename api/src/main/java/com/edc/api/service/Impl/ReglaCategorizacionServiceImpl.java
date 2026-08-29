package com.edc.api.service.Impl;

import com.edc.api.dto.CrearReglaDTO;
import com.edc.api.dto.ReglaDTO;
import com.edc.api.dto.RuleApplicationResult;
import com.edc.api.model.Categoria;
import com.edc.api.model.ReglaCategorizacion;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.ReglaCategorizacionRepository;
import com.edc.api.service.ReglaCategorizacionApplier;
import com.edc.api.service.PagoDeudaService;
import com.edc.api.service.ReglaCategorizacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReglaCategorizacionServiceImpl implements ReglaCategorizacionService {

    private final ReglaCategorizacionRepository reglaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ReglaCategorizacionApplier reglaApplier;
    private final PagoDeudaService pagoDeudaService;

    @Override
    @Transactional
    public ReglaDTO crearRegla(CrearReglaDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + dto.categoriaId()));

        String tipoNormalizado = ReglaCategorizacionApplier.normalizarTipo(dto.tipoPatron());

        ReglaCategorizacion regla = new ReglaCategorizacion();
        regla.setPatron(dto.patron());
        regla.setTipoPatron(tipoNormalizado);
        regla.setCategoria(categoria);
        regla.setActiva(true);

        ReglaCategorizacion reglaGuardada = reglaRepository.save(regla);

        RuleApplicationResult result = reglaApplier.aplicar(categoria, dto.patron(), tipoNormalizado);

        if (result.registrosBotActualizados() > 0) {
            pagoDeudaService.autoMatchRegistrosBotPorCategoria(categoria.getId());
        }

        log.info("Regla creada (tipo={}). Movimientos: {}, Registros bot: {}",
                tipoNormalizado, result.movimientosActualizados(), result.registrosBotActualizados());

        return new ReglaDTO(
                reglaGuardada.getId(),
                reglaGuardada.getPatron(),
                reglaGuardada.getTipoPatron(),
                categoria.getId(),
                reglaGuardada.getActiva(),
                result.movimientosActualizados(),
                result.registrosBotActualizados()
        );
    }
}
