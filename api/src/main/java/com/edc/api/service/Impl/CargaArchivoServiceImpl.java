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

    @Override
    public CargaArchivoResponseDTO cargarEstadoCuenta(
            MultipartFile archivo,
            Long cuentaId
    ) {

        try {
            Path uploadDir = Path.of("/app/uploads");
            Files.createDirectories(uploadDir);

            Path filePath = uploadDir.resolve(archivo.getOriginalFilename());
            archivo.transferTo(filePath.toFile());

            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "--network", "edc-loader_default",
                    "-v", uploadDir.toAbsolutePath() + ":/app/uploads",
                    "edc-python-loader",
                    "python", "python-loader.py",
                    "/app/uploads/" + archivo.getOriginalFilename(),
                    cuentaId.toString()
            );

            pb.inheritIO();
            Process process = pb.start();
            int exitCode = process.waitFor();

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

