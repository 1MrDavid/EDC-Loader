package com.edc.api.service.Impl;

import com.edc.api.dto.BalanceMensualDTO;
import com.edc.api.exception.ResourceNotFoundException;
import com.edc.api.mapper.BalanceMensualMapper;
import com.edc.api.model.BalanceMensual;
import com.edc.api.repository.BalanceMensualRepository;
import com.edc.api.service.BalanceMensualService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
@Slf4j
public class BalanceMensualServiceImpl implements BalanceMensualService {

    private final BalanceMensualRepository repository;
    private final BalanceMensualMapper mapper;

    @Override
    public BalanceMensualDTO obtenerBalance(
            int cuentaId,
            LocalDate periodo
    ) {
        log.info("Consultando balance para la cuenta {} y el periodo {}", cuentaId, periodo);
        BalanceMensual balance = repository
                .findByCuenta_idAndPeriodo(cuentaId, periodo)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No existe balance mensual para la cuenta "
                                        + cuentaId + " y periodo " + periodo
                        )
                );

        return mapper.toDto(balance);
    }
}