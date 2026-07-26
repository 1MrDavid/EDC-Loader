package com.edc.api.controller;

import com.edc.api.dto.CategoriaDTO;
import com.edc.api.dto.CrearCategoriaDTO;
import com.edc.api.service.CategoriaService;
import com.edc.api.dto.CategoriaResumenMesDTO;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    public ResponseEntity<CategoriaDTO> crear(@RequestBody CrearCategoriaDTO dto) {
        CategoriaDTO nuevaCategoria = categoriaService.crearCategoria(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
    }

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> obtenerTodas() {
        List<CategoriaDTO> categorias = categoriaService.obtenerTodas();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/resumen")
    public ResponseEntity<List<CategoriaResumenMesDTO>> obtenerResumen(
            @RequestParam int month, 
            @RequestParam int year) {
        
        List<CategoriaResumenMesDTO> resumen = categoriaService.obtenerResumenMensual(month, year);
        return ResponseEntity.ok(resumen);
    }
}