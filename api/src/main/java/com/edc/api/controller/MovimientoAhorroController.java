package com.edc.api.controller;

import com.edc.api.dto.CrearMovimientoAhorroDTO;
import com.edc.api.dto.MovimientoAhorroDTO;
import com.edc.api.service.MovimientoAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movimientos-ahorro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoAhorroController {

    private final MovimientoAhorroService movimientoAhorroService;

    @GetMapping
    public ResponseEntity<List<MovimientoAhorroDTO>> obtenerPorCuenta(
            @RequestParam Long cuentaAhorroId) {
        return ResponseEntity.ok(movimientoAhorroService.obtenerPorCuenta(cuentaAhorroId));
    }

    @PostMapping
    public ResponseEntity<MovimientoAhorroDTO> registrar(@RequestBody CrearMovimientoAhorroDTO dto) {
        MovimientoAhorroDTO creado = movimientoAhorroService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        movimientoAhorroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
