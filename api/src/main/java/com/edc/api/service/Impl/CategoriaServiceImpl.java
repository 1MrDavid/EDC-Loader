package com.edc.api.service.Impl;

import com.edc.api.dto.CategoriaDTO;
import com.edc.api.dto.CategoriaResumenMesDTO;
import com.edc.api.dto.CrearCategoriaDTO;
import com.edc.api.model.Categoria;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.service.CategoriaService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional
    public CategoriaDTO crearCategoria(CrearCategoriaDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNombre(dto.nombre());
        categoria.setTipo(dto.tipo().toUpperCase());
        categoria.setActiva(true); // Activa por defecto al crearse

        Categoria guardada = categoriaRepository.save(categoria);

        return new CategoriaDTO(
                guardada.getId(),
                guardada.getNombre(),
                guardada.getTipo(),
                guardada.getActiva()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerTodas() {
        return categoriaRepository.findAll().stream()
                .map(categoria -> new CategoriaDTO(
                        categoria.getId(),
                        categoria.getNombre(),
                        categoria.getTipo(),
                        categoria.getActiva()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResumenMesDTO> obtenerResumenMensual(int month, int year) {
        LocalDate inicio = LocalDate.of(year, month, 1);
        // Un pequeño truco para obtener el último día del mes
        LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());
        
        return categoriaRepository.obtenerResumenPorMes(inicio, fin);
    }
}