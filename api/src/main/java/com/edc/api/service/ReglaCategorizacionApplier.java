package com.edc.api.service;

import com.edc.api.dto.RuleApplicationResult;
import com.edc.api.model.Categoria;
import com.edc.api.repository.MovimientoRepository;
import com.edc.api.repository.RegistroBotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReglaCategorizacionApplier {

    private final MovimientoRepository movimientoRepository;
    private final RegistroBotRepository registroBotRepository;

    public RuleApplicationResult aplicar(Categoria categoria, String patron, String tipoPatron) {
        String tipo = normalizarTipo(tipoPatron);

        int movimientos = switch (tipo) {
            case "BENEFICIARIO" -> movimientoRepository.aplicarReglaPorBeneficiario(categoria, patron);
            case "REFERENCIA" -> movimientoRepository.aplicarReglaPorReferencia(categoria, patron);
            default -> movimientoRepository.aplicarReglaPorDescripcion(categoria, patron);
        };

        int registrosBot = switch (tipo) {
            case "BENEFICIARIO" -> registroBotRepository.aplicarReglaPorBeneficiario(categoria, patron);
            case "REFERENCIA" -> registroBotRepository.aplicarReglaPorReferencia(categoria, patron);
            default -> registroBotRepository.aplicarReglaPorConcepto(categoria, patron);
        };

        return new RuleApplicationResult(movimientos, registrosBot);
    }

    public static String normalizarTipo(String tipoPatron) {
        if (tipoPatron == null || tipoPatron.isBlank()) {
            return "CONCEPTO";
        }
        return switch (tipoPatron.toUpperCase()) {
            case "DESCRIPCION", "CONCEPTO" -> "CONCEPTO";
            case "BENEFICIARIO" -> "BENEFICIARIO";
            case "REFERENCIA" -> "REFERENCIA";
            default -> "CONCEPTO";
        };
    }
}
