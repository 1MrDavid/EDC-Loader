package com.edc.api.mapper;

import com.edc.api.dto.CategoriaResumenDTO;
import com.edc.api.dto.RegistroBotDTO;
import com.edc.api.model.RegistroBot;
import org.springframework.stereotype.Component;

@Component
public class RegistroBotMapper {

    public RegistroBotDTO toDto(RegistroBot entity) {
        return new RegistroBotDTO(
                entity.getId(),
                entity.getTipo(),
                entity.getMonto(),
                entity.getReferencia(),
                entity.getFecha(),
                entity.getBancoOrigen(),
                entity.getBancoDestino(),
                entity.getBeneficiario(),
                entity.getTelefono(),
                entity.getIdentificacion(),
                entity.getConcepto(),
                entity.getProcesado(),
                entity.getFechaCreacion(),
                entity.getCategoria() != null ? new CategoriaResumenDTO(
                    entity.getCategoria().getId(),
                    entity.getCategoria().getNombre(),
                    entity.getCategoria().getColor(),
                    entity.getCategoria().getIcono()
                ) : null,
                entity.getEsIngreso(),
                entity.getMontoDolar()
        );
    }
}