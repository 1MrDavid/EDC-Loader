package com.edc.api.controller;

import com.edc.api.dto.CrearReglaDTO;
import com.edc.api.dto.ReglaDTO;
import com.edc.api.service.ReglaCategorizacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reglas")
@RequiredArgsConstructor
public class ReglaCategorizacionController {

    private final ReglaCategorizacionService reglaService;

    @PostMapping
    public ResponseEntity<ReglaDTO> crear(@RequestBody CrearReglaDTO dto) {
        ReglaDTO nuevaRegla = reglaService.crearRegla(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRegla);
    }
}