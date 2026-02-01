package com.edc.api.service;

import com.edc.api.dto.BalanceMensualDTO;
import com.edc.api.dto.BalancesMensualesDTO;

import java.time.LocalDate;
import java.util.List;

public interface BalanceMensualService {

    BalanceMensualDTO obtenerBalance(
            int cuentaId,
            LocalDate periodo
    );

    List<BalancesMensualesDTO> resumenGlobal();

    List<BalancesMensualesDTO> resumenPorCuenta(int cuentaId);
}
