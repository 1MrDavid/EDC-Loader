package com.edc.api.controller;

import com.edc.api.dto.ActualizarMetaDTO;
import com.edc.api.dto.CrearMetaDTO;
import com.edc.api.dto.MetaAhorroDTO;
import com.edc.api.service.MetaAhorroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/metas-ahorro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetaAhorroController {

    private final MetaAhorroService metaAhorroService;

    @GetMapping
    public ResponseEntity<List<MetaAhorroDTO>> listarMetasActivas() {
        return ResponseEntity.ok(metaAhorroService.listarMetasActivas());
    }

    @PostMapping
    public ResponseEntity<MetaAhorroDTO> crear(@RequestBody CrearMetaDTO dto) {
        MetaAhorroDTO creada = metaAhorroService.crearMeta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetaAhorroDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ActualizarMetaDTO dto) {
        return ResponseEntity.ok(metaAhorroService.actualizarMeta(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        metaAhorroService.eliminarMeta(id);
        return ResponseEntity.noContent().build();
    }
}
