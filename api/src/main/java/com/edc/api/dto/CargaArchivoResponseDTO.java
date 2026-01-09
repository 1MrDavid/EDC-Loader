package com.edc.api.dto;

public record CargaArchivoResponseDTO(
        String nombreArchivo,
        Long cuentaId,
        String estado, // PROCESADO / ERROR
        String mensaje
) {
}
