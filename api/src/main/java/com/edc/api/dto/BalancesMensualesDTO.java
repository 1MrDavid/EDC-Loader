package com.edc.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface BalancesMensualesDTO {

    LocalDate getPeriodo();

    BigDecimal getTotalIngresos();

    BigDecimal getTotalEgresos();
}
