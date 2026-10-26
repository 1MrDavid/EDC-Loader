package com.edc.api.service.Impl;

import com.edc.api.dto.ActualizarCategoriaDTO;
import com.edc.api.dto.CategoriaDTO;
import com.edc.api.dto.CategoriaResumenMesDTO;
import com.edc.api.dto.CrearCategoriaDTO;
import com.edc.api.exception.DuplicateResourceException;
import com.edc.api.exception.ResourceNotFoundException;
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
        String nombre = validarNombre(dto.nombre());
        String tipo = validarTipo(dto.tipo());

        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new DuplicateResourceException("Ya existe una categoría con el nombre '" + nombre + "'");
        }

        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setTipo(tipo);
        categoria.setActiva(true);
        categoria.setColor(dto.color());
        categoria.setIcono(dto.icono());

        return mapToDto(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional
    public CategoriaDTO actualizarCategoria(Long id, ActualizarCategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        String nombre = dto.nombre();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new DuplicateResourceException("Ya existe una categoría con el nombre '" + nombre + "'");
        }

        categoria.setNombre(nombre);
        categoria.setTipo(dto.tipo());
        categoria.setColor(dto.color());
        categoria.setIcono(dto.icono());

        return mapToDto(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::mapToDto)
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

    private CategoriaDTO mapToDto(Categoria categoria) {
        return new CategoriaDTO(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getTipo(),
                categoria.getColor(),
                categoria.getIcono(),
                categoria.getActiva()
        );
    }

    private String validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        return nombre.trim();
    }

    private String validarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("El tipo de la categoría es obligatorio");
        }
        String tipoNormalizado = tipo.trim().toUpperCase();
        if (!tipoNormalizado.equals("INGRESO") && !tipoNormalizado.equals("EGRESO")) {
            throw new IllegalArgumentException("El tipo debe ser INGRESO o EGRESO");
        }
        return tipoNormalizado;
    }
}