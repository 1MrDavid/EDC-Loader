package com.edc.api.controller;

import com.edc.api.model.Finanzas;
import com.edc.api.repository.FinanzasRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class FinanzasController {

    private final FinanzasRepository finanzasRepository;

    public FinanzasController(FinanzasRepository finanzasRepository) {
        this.finanzasRepository = finanzasRepository;
    }

    @GetMapping
    public List<Finanzas> obtenerTodas() {
        return  finanzasRepository.findAll();
    }
}
