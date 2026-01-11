package com.edc.api.service;

import com.edc.api.dto.BalanceMensualDTO;

import java.time.LocalDate;

public interface BalanceMensualService {

    BalanceMensualDTO obtenerBalance(
            int cuentaId,
            LocalDate periodo
    );
}
