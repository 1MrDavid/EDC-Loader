package com.edc.api.service.Impl;

import com.edc.api.dto.CrearReglaDTO;
import com.edc.api.dto.ReglaDTO;
import com.edc.api.model.Categoria;
import com.edc.api.model.ReglaCategorizacion;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.ReglaCategorizacionRepository;
import com.edc.api.service.ReglaCategorizacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.edc.api.service.MovimientoService;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReglaCategorizacionServiceImpl implements ReglaCategorizacionService {

    private final ReglaCategorizacionRepository reglaRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimientoService movimientoService;

    @Override
    @Transactional
    public ReglaDTO crearRegla(CrearReglaDTO dto) {
        // 1. Validar que la categoría exista
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + dto.categoriaId()));

        // 2. Crear y guardar la nueva regla
        ReglaCategorizacion regla = new ReglaCategorizacion();
        regla.setPatron(dto.patron());
        regla.setTipoPatron(dto.tipoPatron().toUpperCase());
        regla.setCategoria(categoria);
        regla.setActiva(true);

        ReglaCategorizacion reglaGuardada = reglaRepository.save(regla);

        // 3. Aplicar retroactivamente a los movimientos existentes (Bulk Update)
        int movimientosActualizados = movimientoService.aplicarReglaMasiva(categoria, dto.patron());
        
        log.info("Regla creada. Se aplicó la categoría '{}' a {} movimientos históricos.", 
                 categoria.getNombre(), movimientosActualizados);

        // 4. Retornar DTO
        return new ReglaDTO(
                reglaGuardada.getId(),
                reglaGuardada.getPatron(),
                reglaGuardada.getTipoPatron(),
                categoria.getId(),
                reglaGuardada.getActiva()
        );
    }
}