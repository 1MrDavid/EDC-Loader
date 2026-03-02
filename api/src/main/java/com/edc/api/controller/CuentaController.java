package com.edc.api.controller;

import com.edc.api.dto.CrearCuentaDTO;
import com.edc.api.dto.CuentaDTO;
import com.edc.api.service.CuentaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cuentas")
@AllArgsConstructor
public class CuentaController {

    private final CuentaService cuentaService;

    @GetMapping
    public ResponseEntity<List<CuentaDTO>> obtenerTodas() {

        List<CuentaDTO> cuentas = cuentaService.obtenerTodas();

        return ResponseEntity.ok(cuentas);
    }

    @PostMapping
    public ResponseEntity<CuentaDTO> crear(@RequestBody CrearCuentaDTO dto) {
        CuentaDTO cuenta = cuentaService.crearCuenta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(cuenta);
    }
}
