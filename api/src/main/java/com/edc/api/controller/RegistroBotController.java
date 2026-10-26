package com.edc.api.controller;

import com.edc.api.dto.CrearRegistroBotDTO;
import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.service.RegistroBotService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bot")
@AllArgsConstructor
public class RegistroBotController {

    private final RegistroBotService service;

    @GetMapping("/pendientes")
    public ResponseEntity<List<RegistroBotDTO>> obtenerPendientes() {
        return ResponseEntity.ok(service.obtenerPendientes());
    }

    @PostMapping("/recibos")
    public ResponseEntity<RegistroBotDTO> crearRegistro(@RequestBody CrearRegistroBotDTO dto) {
        return ResponseEntity.ok(service.crearRegistro(dto));
    }

    @PostMapping("/conciliar")
    public ResponseEntity<Map<String, Object>> forzarConciliacion() {
        int registrosConciliados = service.forzarConciliacionGlobal();
        return ResponseEntity.ok(Map.of(
                "mensaje", "Conciliación finalizada",
                "conciliados", registrosConciliados
        ));
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