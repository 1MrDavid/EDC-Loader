package com.edc.api.controller;

import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.service.RegistroBotService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bot")
@AllArgsConstructor
public class RegistroBotController {

    private final RegistroBotService service;

    @GetMapping("/pendientes")
    public ResponseEntity<List<RegistroBotDTO>> obtenerPendientes() {
        return ResponseEntity.ok(service.obtenerPendientes());
    }

    @PutMapping("/{id}/procesar")
    public ResponseEntity<Void> marcarProcesado(@PathVariable Long id) {
        service.marcarComoProcesadoManual(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroBotDTO> actualizarRegistro(@PathVariable Long id, @RequestBody RegistroBotDTO dto) {
        return ResponseEntity.ok(service.actualizarRegistro(id, dto));
    }
}