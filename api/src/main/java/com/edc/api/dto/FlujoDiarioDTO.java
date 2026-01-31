package com.edc.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface FlujoDiarioDTO {

    LocalDate getFecha();

    Long getIngresos();

    Long getEgresos();

    BigDecimal getTotalIngresos();

    BigDecimal getTotalEgresos();
}
