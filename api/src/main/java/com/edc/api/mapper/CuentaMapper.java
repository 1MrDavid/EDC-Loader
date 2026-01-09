package com.edc.api.mapper;

import com.edc.api.dto.CuentaDTO;
import com.edc.api.model.Cuenta;
import org.springframework.stereotype.Component;

@Component
public class CuentaMapper {

    public CuentaDTO toDto(Cuenta entity) {
        CuentaDTO dto = new CuentaDTO(
                entity.getId(),
                entity.getNumero(),
                entity.getBanco()
        );

        return dto;
    }
}
