package com.edc.api.service;

import com.edc.api.dto.CargaArchivoResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface CargaArchivoService {

    CargaArchivoResponseDTO cargarEstadoCuenta(
            MultipartFile archivo,
            Long cuentaId
    );
}