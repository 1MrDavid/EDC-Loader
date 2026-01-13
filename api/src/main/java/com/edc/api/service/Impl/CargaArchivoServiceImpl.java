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

    private static final String UPLOAD_DIR = "/app/uploads";
    private static final String PYTHON_URL = "http://python-loader:5000/procesar";

    @Override
    public CargaArchivoResponseDTO cargarEstadoCuenta(
            MultipartFile archivo,
            Long cuentaId
    ) {
        try {
            PythonCargaResponseDTO response = webClient.post()
                    .uri("http://python-loader:5000/procesar")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData("archivo", archivo.getResource())
                            .with("cuenta_id", cuentaId))
                    .retrieve()
                    .bodyToMono(PythonCargaResponseDTO.class)
                    .block();

            if (response == null || !"OK".equalsIgnoreCase(response.estado())) {
                return new CargaArchivoResponseDTO(
                        archivo.getOriginalFilename(),
                        cuentaId,
                        "ERROR",
                        "Error procesando archivo"
                );
            }

            return new CargaArchivoResponseDTO(
                    archivo.getOriginalFilename(),
                    cuentaId,
                    "PROCESADO",
                    response.mensaje()
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
