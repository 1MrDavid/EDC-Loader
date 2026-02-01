package com.edc.api.controller;

import com.edc.api.dto.ValorDolarDTO;
import com.edc.api.service.ValorDolarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/valor-dolar")
@RequiredArgsConstructor
public class ValorDolarController {

    private final ValorDolarService valorDolarService;

    @GetMapping
    public ResponseEntity<List<ValorDolarDTO>> obtenerValoresDolar() {
        return ResponseEntity.ok(valorDolarService.obtenerTodos());
    }
}

