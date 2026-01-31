package com.edc.api.service.Impl;

import com.edc.api.dto.CargaArchivoResponseDTO;
import com.edc.api.dto.PythonCargaResponseDTO;
import com.edc.api.service.CargaArchivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class CargaArchivoServiceImpl implements CargaArchivoService {

    private final WebClient webClient;

    private static final String PYTHON_URL = "http://python-loader:5000/api/cargar-estado";

    @Override
    public CargaArchivoResponseDTO cargarEstadoCuenta(
            MultipartFile archivo,
            Long cuentaId,
            String banco
    ) {

        try {
            PythonCargaResponseDTO response = webClient.post()
                    .uri(PYTHON_URL)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters
                            .fromMultipartData("file", archivo.getResource())
                            .with("cuenta_id", cuentaId)
                            .with("banco", banco)
                    )
                    .retrieve()
                    .bodyToMono(PythonCargaResponseDTO.class)
                    .block();

            if (response == null) {
                return new CargaArchivoResponseDTO(
                        archivo.getOriginalFilename(),
                        cuentaId,
                        "ERROR",
                        "Respuesta nula del servicio de procesamiento"
                );
            }

            if (!"success".equalsIgnoreCase(response.status())) {
                return new CargaArchivoResponseDTO(
                        archivo.getOriginalFilename(),
                        cuentaId,
                        "ERROR",
                        response.message()
                );
            }

            return new CargaArchivoResponseDTO(
                    archivo.getOriginalFilename(),
                    cuentaId,
                    "PROCESADO",
                    response.message()
            );

        } catch (Exception e) {
            return new CargaArchivoResponseDTO(
                    archivo.getOriginalFilename(),
                    cuentaId,
                    "ERROR",
                    e.getMessage()
            );
        }
    }
}

