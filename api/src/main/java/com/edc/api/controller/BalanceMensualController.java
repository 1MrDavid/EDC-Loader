package com.edc.api.controller;

import com.edc.api.dto.BalanceMensualDTO;
import com.edc.api.service.BalanceMensualService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/balance-mensual")
@AllArgsConstructor
@Slf4j
public class BalanceMensualController {

    private final BalanceMensualService service;

    @GetMapping
    public ResponseEntity<BalanceMensualDTO> obtenerBalance(
            @RequestParam int cuentaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate periodo
    ) {
        log.info("Consultando balance para la cuenta {} y el periodo {}", cuentaId, periodo);
        return ResponseEntity.ok(service.obtenerBalance(cuentaId, periodo));
    }
}
