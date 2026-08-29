package com.edc.api.controller;

import com.edc.api.dto.ActualizarCuentaAhorroDTO;
import com.edc.api.dto.CrearCuentaAhorroDTO;
import com.edc.api.dto.CuentaAhorroDTO;
import com.edc.api.service.CuentaAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cuentas-ahorro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CuentaAhorroController {

    private final CuentaAhorroService cuentaAhorroService;

    @GetMapping
    public ResponseEntity<List<CuentaAhorroDTO>> obtenerCuentasAhorro() {
        return ResponseEntity.ok(cuentaAhorroService.obtenerCuentasAhorro());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuentaAhorroDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cuentaAhorroService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CuentaAhorroDTO> crear(@RequestBody CrearCuentaAhorroDTO dto) {
        CuentaAhorroDTO creada = cuentaAhorroService.crearCuenta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CuentaAhorroDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ActualizarCuentaAhorroDTO dto) {
        return ResponseEntity.ok(cuentaAhorroService.actualizarCuenta(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cuentaAhorroService.eliminarCuenta(id);
        return ResponseEntity.noContent().build();
    }
}
