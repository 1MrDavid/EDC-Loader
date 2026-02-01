package com.edc.api.mapper;

import com.edc.api.dto.ValorDolarDTO;
import com.edc.api.model.ValorDolar;
import org.springframework.stereotype.Component;

@Component
public class ValorDolarMapper {

    public ValorDolarDTO toDto(ValorDolar entity) {
        return new ValorDolarDTO(
                entity.getFecha(),
                entity.getDia(),
                entity.getMes(),
                entity.getAno(),
                entity.getPrecio()
        );
    }
}
