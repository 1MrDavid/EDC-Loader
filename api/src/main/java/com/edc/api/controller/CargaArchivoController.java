package com.edc.api.controller;

import com.edc.api.dto.CargaArchivoResponseDTO;
import com.edc.api.service.CargaArchivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/cargas")
@RequiredArgsConstructor
public class CargaArchivoController {

    private final CargaArchivoService cargaArchivoService;

    @PostMapping("/estado-cuenta")
    public ResponseEntity<CargaArchivoResponseDTO> cargarEstadoCuenta(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("cuentaId") Long cuentaId
    ) {
        return ResponseEntity.ok(
                cargaArchivoService.cargarEstadoCuenta(archivo, cuentaId)
        );
    }
}

