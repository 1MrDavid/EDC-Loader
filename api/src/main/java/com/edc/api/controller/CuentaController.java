package com.edc.api.controller;

import com.edc.api.dto.CuentaDTO;
import com.edc.api.service.CuentaService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
