package com.edc.api.service.Impl;

import com.edc.api.dto.CargaArchivoResponseDTO;
import com.edc.api.service.CargaArchivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class CargaArchivoServiceImpl implements CargaArchivoService {

    private static final String PYTHON_SCRIPT = "C:\\Users\\david\\OneDrive\\Escritorio\\Si\\Repositorios\\EDC-Loader\\carga-datos\\python-loader.py";

    @Override
    public CargaArchivoResponseDTO cargarEstadoCuenta(
            MultipartFile archivo,
            Long cuentaId
    ) {

        try {
            // 1. Guardar archivo temporal
            Path tempFile = Files.createTempFile("edc-", ".txt");
            archivo.transferTo(tempFile.toFile());

            // 2. Ejecutar Python
            ProcessBuilder pb = new ProcessBuilder(
                    "python",
                    PYTHON_SCRIPT,
                    tempFile.toAbsolutePath().toString(),
                    cuentaId.toString()
            );

            pb.inheritIO();
            Process process = pb.start();

            int exitCode = process.waitFor();

            Files.deleteIfExists(tempFile);

            if (exitCode != 0) {
                return new CargaArchivoResponseDTO(
                        archivo.getOriginalFilename(),
                        cuentaId,
                        "ERROR",
                        "Error procesando el archivo"
                );
            }

            return new CargaArchivoResponseDTO(
                    archivo.getOriginalFilename(),
                    cuentaId,
                    "PROCESADO",
                    "Archivo cargado correctamente"
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
