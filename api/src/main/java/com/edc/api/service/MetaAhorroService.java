package com.edc.api.service;

import com.edc.api.dto.ActualizarMetaDTO;
import com.edc.api.dto.CrearMetaDTO;
import com.edc.api.dto.MetaAhorroDTO;

import java.util.List;

public interface MetaAhorroService {

    List<MetaAhorroDTO> listarMetasActivas();

    MetaAhorroDTO crearMeta(CrearMetaDTO dto);

    MetaAhorroDTO actualizarMeta(Long id, ActualizarMetaDTO dto);

    void eliminarMeta(Long id);
}
