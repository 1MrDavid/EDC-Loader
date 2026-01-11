package com.edc.api.util;

public class AppConstant {

    // Mensajes de log
    public static final String LOG_ENTERING_METHOD = "Entrando al método: {}";
    public static final String LOG_EXITING_METHOD = "Saliendo del método: {}";

    // Para LoggingFilter usado para trazabilidad
    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TRACE_ID_MDC_KEY = "traceId";

    public AppConstant() {}
}
