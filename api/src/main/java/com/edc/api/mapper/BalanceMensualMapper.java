package com.edc.api.mapper;

import com.edc.api.dto.BalanceMensualDTO;
import com.edc.api.model.BalanceMensual;
import org.springframework.stereotype.Component;

@Component
public class BalanceMensualMapper {

    public BalanceMensualDTO toDto(BalanceMensual entity) {
        return new BalanceMensualDTO(
                entity.getCuenta_id(),
                entity.getPeriodo(),
                entity.getMonto_inicio(),
                entity.getMonto_final(),
                entity.getIngresos_total(),
                entity.getEgresos_total(),
                entity.getNumero_ingresos(),
                entity.getNumero_egresos(),
                entity.getSaldo_variacion(),
                entity.getFlujo_neto(),
                entity.getPromedio_ingreso(),
                entity.getPromedio_egreso()
        );
    }
}
