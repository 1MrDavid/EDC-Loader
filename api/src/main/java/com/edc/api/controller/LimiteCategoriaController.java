package com.edc.api.controller;

import com.edc.api.dto.ActualizarLimiteDTO;
import com.edc.api.dto.CrearLimiteDTO;
import com.edc.api.dto.LimiteCategoriaDTO;
import com.edc.api.service.LimiteCategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/limites-categoria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LimiteCategoriaController {

    private final LimiteCategoriaService limiteCategoriaService;

    @GetMapping
    public ResponseEntity<List<LimiteCategoriaDTO>> obtenerLimites(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(limiteCategoriaService.obtenerLimites(month, year));
    }

    @PostMapping
    public ResponseEntity<LimiteCategoriaDTO> crear(@RequestBody CrearLimiteDTO dto) {
        LimiteCategoriaDTO creado = limiteCategoriaService.crearLimite(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LimiteCategoriaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ActualizarLimiteDTO dto) {
        return ResponseEntity.ok(limiteCategoriaService.actualizarLimite(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        limiteCategoriaService.eliminarLimite(id);
        return ResponseEntity.noContent().build();
    }
}
