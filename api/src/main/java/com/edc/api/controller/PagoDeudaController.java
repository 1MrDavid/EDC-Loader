package com.edc.api.controller;

import com.edc.api.dto.PagoDeudaDTO;
import com.edc.api.dto.RegistrarPagoDeudaDTO;
import com.edc.api.service.DeudaService;
import com.edc.api.service.PagoDeudaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pagos-deuda")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PagoDeudaController {

    private final DeudaService deudaService;
    private final PagoDeudaService pagoDeudaService;

    @GetMapping
    public ResponseEntity<List<PagoDeudaDTO>> obtenerPagos(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(deudaService.obtenerPagosPorPeriodo(month, year));
    }

    @GetMapping("/registro-bot/{registroBotId}")
    public ResponseEntity<PagoDeudaDTO> obtenerPorRegistroBot(@PathVariable Long registroBotId) {
        return pagoDeudaService.obtenerPorRegistroBot(registroBotId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PagoDeudaDTO> registrar(@RequestBody RegistrarPagoDeudaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoDeudaService.registrarPago(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoDeudaService.eliminarPago(id);
        return ResponseEntity.noContent().build();
    }
}
