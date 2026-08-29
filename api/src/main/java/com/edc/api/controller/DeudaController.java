package com.edc.api.controller;

import com.edc.api.dto.ActualizarDeudaDTO;
import com.edc.api.dto.CrearDeudaDTO;
import com.edc.api.dto.DeudaDTO;
import com.edc.api.service.DeudaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deudas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeudaController {
    
    private final DeudaService deudaService;

    @GetMapping
    public ResponseEntity<List<DeudaDTO>> obtenerDeudasActivas(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(deudaService.obtenerDeudasActivas(month, year));
    }

    @PostMapping
    public ResponseEntity<DeudaDTO> crear(@RequestBody CrearDeudaDTO dto) {
        DeudaDTO nuevaDeuda = deudaService.crearDeuda(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaDeuda);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeudaDTO> actualizar(@PathVariable Long id, @RequestBody ActualizarDeudaDTO dto) {
        return ResponseEntity.ok(deudaService.actualizarDeuda(id, dto));
    }
}