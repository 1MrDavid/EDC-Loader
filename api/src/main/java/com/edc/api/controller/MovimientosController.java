package com.edc.api.controller;

import com.edc.api.dto.MovimientoDTO;
import com.edc.api.model.Movimiento;
import com.edc.api.repository.MovimientoRepository;
import com.edc.api.service.MovimientoService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/movimientos")
@AllArgsConstructor
public class MovimientosController {

    private final MovimientoService movimientoService;

    @GetMapping("/page")
    public ResponseEntity<Page<MovimientoDTO>> obtenerMovimientosPaginados(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaAdd,desc") String[] sort
    ) {

        Sort sorting = Sort.by(
                Sort.Order.desc(sort[0])
        );

        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<MovimientoDTO> pagina = movimientoService.obtenerPorPagina(inicio, fin, pageable);

        return ResponseEntity.ok(pagina);
    }
}
