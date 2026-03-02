package com.edc.api.mapper;

import com.edc.api.dto.CrearCuentaDTO;
import com.edc.api.dto.CuentaDTO;
import com.edc.api.model.Cuenta;
import org.springframework.stereotype.Component;

@Component
public class CuentaMapper {

    public CuentaDTO toDto(Cuenta entity) {
        return new CuentaDTO(
                entity.getId(),
                entity.getNumero(),
                entity.getBanco()
        );
    }

    public Cuenta toEntity(CrearCuentaDTO dto) {
        Cuenta cuenta = new Cuenta();
        cuenta.setNumero(dto.numero());
        cuenta.setBanco(dto.banco());
        return cuenta;
    }
}
