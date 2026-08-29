package com.edc.api.service.Impl;

import com.edc.api.dto.ActualizarLimiteDTO;
import com.edc.api.dto.CategoriaResumenMesDTO;
import com.edc.api.dto.CrearLimiteDTO;
import com.edc.api.dto.LimiteCategoriaDTO;
import com.edc.api.model.Categoria;
import com.edc.api.model.LimiteCategoria;
import com.edc.api.repository.CategoriaRepository;
import com.edc.api.repository.LimiteCategoriaRepository;
import com.edc.api.service.CategoriaService;
import com.edc.api.service.LimiteCategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LimiteCategoriaServiceImpl implements LimiteCategoriaService {

    private final LimiteCategoriaRepository limiteCategoriaRepository;
    private final CategoriaRepository categoriaRepository;
    private final CategoriaService categoriaService;

    @Override
    @Transactional(readOnly = true)
    public List<LimiteCategoriaDTO> obtenerLimites(int mes, int ano) {
        List<LimiteCategoria> limites = limiteCategoriaRepository.findLimitesAplicables(mes, ano);
        Map<Long, LimiteCategoria> limitesResueltos = resolverColisiones(limites);
        Map<Long, Double> gastosPorCategoria = construirMapaGastos(mes, ano);

        return limitesResueltos.values().stream()
                .map(limite -> mapToDto(limite, gastosPorCategoria))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LimiteCategoriaDTO crearLimite(CrearLimiteDTO dto) {
        if (dto.categoriaId() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        if (dto.montoUsd() == null || dto.montoUsd() <= 0) {
            throw new IllegalArgumentException("El monto del límite debe ser mayor a cero");
        }

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        LimiteCategoria limite = new LimiteCategoria();
        limite.setCategoria(categoria);
        limite.setMontoUsd(dto.montoUsd());
        limite.setMes(dto.mes());
        limite.setAno(dto.ano());
        limite.setActiva(true);

        LimiteCategoria guardado = limiteCategoriaRepository.save(limite);

        int mesConsulta = dto.mes() != null ? dto.mes() : java.time.LocalDate.now().getMonthValue();
        int anoConsulta = dto.ano() != null ? dto.ano() : java.time.LocalDate.now().getYear();
        Map<Long, Double> gastos = construirMapaGastos(mesConsulta, anoConsulta);

        return mapToDto(guardado, gastos);
    }

    @Override
    @Transactional
    public LimiteCategoriaDTO actualizarLimite(Long id, ActualizarLimiteDTO dto) {
        LimiteCategoria limite = limiteCategoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Límite no encontrado"));

        if (dto.categoriaId() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        if (dto.montoUsd() == null || dto.montoUsd() <= 0) {
            throw new IllegalArgumentException("El monto del límite debe ser mayor a cero");
        }

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        limite.setCategoria(categoria);
        limite.setMontoUsd(dto.montoUsd());
        limite.setMes(dto.mes());
        limite.setAno(dto.ano());
        if (dto.activa() != null) {
            limite.setActiva(dto.activa());
        }

        LimiteCategoria guardado = limiteCategoriaRepository.save(limite);

        int mesConsulta = dto.mes() != null ? dto.mes() : java.time.LocalDate.now().getMonthValue();
        int anoConsulta = dto.ano() != null ? dto.ano() : java.time.LocalDate.now().getYear();
        Map<Long, Double> gastos = construirMapaGastos(mesConsulta, anoConsulta);

        return mapToDto(guardado, gastos);
    }

    @Override
    @Transactional
    public void eliminarLimite(Long id) {
        LimiteCategoria limite = limiteCategoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Límite no encontrado"));
        limite.setActiva(false);
        limiteCategoriaRepository.save(limite);
    }

    private Map<Long, LimiteCategoria> resolverColisiones(List<LimiteCategoria> limites) {
        Map<Long, LimiteCategoria> globales = new LinkedHashMap<>();
        Map<Long, LimiteCategoria> especificos = new LinkedHashMap<>();

        for (LimiteCategoria limite : limites) {
            Long categoriaId = limite.getCategoria().getId();
            if (limite.getMes() == null && limite.getAno() == null) {
                globales.putIfAbsent(categoriaId, limite);
            } else {
                especificos.put(categoriaId, limite);
            }
        }

        Map<Long, LimiteCategoria> resultado = new LinkedHashMap<>(globales);
        resultado.putAll(especificos);
        return resultado;
    }

    private Map<Long, Double> construirMapaGastos(int mes, int ano) {
        return categoriaService.obtenerResumenMensual(mes, ano).stream()
                .filter(resumen -> "EGRESO".equalsIgnoreCase(resumen.tipo()))
                .collect(Collectors.toMap(
                        CategoriaResumenMesDTO::id,
                        resumen -> resumen.montoTotalDolar() != null ? resumen.montoTotalDolar() : 0.0,
                        Double::sum
                ));
    }

    private LimiteCategoriaDTO mapToDto(LimiteCategoria limite, Map<Long, Double> gastosPorCategoria) {
        Categoria categoria = limite.getCategoria();
        Long categoriaId = categoria.getId();
        double limiteUsd = limite.getMontoUsd() != null ? limite.getMontoUsd() : 0.0;
        double gastadoUsd = gastosPorCategoria.getOrDefault(categoriaId, 0.0);
        double porcentaje = limiteUsd > 0 ? (gastadoUsd / limiteUsd) * 100.0 : 0.0;

        return new LimiteCategoriaDTO(
                limite.getId(),
                categoriaId,
                categoria.getNombre(),
                categoria.getColor(),
                categoria.getIcono(),
                redondear(limiteUsd),
                redondear(gastadoUsd),
                redondear(porcentaje),
                calcularEstado(porcentaje),
                limite.getMes(),
                limite.getAno(),
                limite.getMes() == null && limite.getAno() == null
        );
    }

    private String calcularEstado(double porcentajeConsumo) {
        if (porcentajeConsumo > 90.0) {
            return "DANGER";
        }
        if (porcentajeConsumo > 70.0) {
            return "WARNING";
        }
        return "SAFE";
    }

    private double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
