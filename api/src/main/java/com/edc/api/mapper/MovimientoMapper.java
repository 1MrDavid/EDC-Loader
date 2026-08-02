package com.edc.api.mapper;

import com.edc.api.dto.CategoriaResumenDTO;
import com.edc.api.dto.MovimientoDTO;
import com.edc.api.model.Movimiento;
import org.springframework.stereotype.Component;

@Component
public class MovimientoMapper {

    public MovimientoDTO toDto(Movimiento entity) {
        return new MovimientoDTO(
                entity.getId(),
                entity.getCuentaId(),
                entity.getFechaAdd(),
                entity.getFechavalor(),
                entity.getFechaEfec(),
                entity.getReferencia(),
                entity.getDescripcion(),
                
                entity.getBeneficiario(),
                entity.getIdentificacion(),
                entity.getTelefono(),
                entity.getBancoDestino(),
                
                entity.getEgreso(),
                entity.getIngreso(),
                entity.getSaldo(),
                entity.getIngresodolar(),
                entity.getEgresodolar(),
                entity.getSaldodolar(),
                entity.getTasadolar(),
                entity.getCategoria() != null ? new CategoriaResumenDTO(
                    entity.getCategoria().getId(),
                    entity.getCategoria().getNombre(),
                    entity.getCategoria().getColor(),
                    entity.getCategoria().getIcono()
                ) : null
        );
    }
}