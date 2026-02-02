export interface CuentaDTO {
  id?: number;
  numero: string;
  cuenta: string;
}

export interface MovimientoDTO {
  id: number;
  fechaAdd: string;
  fechavalor: string | null;
  fechaefec: string | null;
  referencia: string | null;
  descripcion: string;

  egreso: number | null;
  ingreso: number | null;
  saldo: number | null;

  ingresodolar: number | null;
  egresodolar: number | null;
  saldodolar: number | null;
  tasadolar: number | null;

  categoria: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CargaArchivoResponseDTO {
  nombreArchivo: string;
  cuentaId: number;
  estado: "PROCESADO" | "ERROR";
  mensaje: string;
}

export interface BalanceMensualDTO {
  cuenta_id: number;
  periodo: string; // "YYYY-MM-DD"
  
  monto_inicio: number;
  monto_final: number;
  
  ingresos_total: number;
  egresos_total: number;
  
  numero_ingresos: number;
  numero_egresos: number;
  
  saldo_variacion: number;
  flujo_neto: number;
  
  promedio_ingreso: number;
  promedio_egreso: number;
}

export interface FlujoDiarioDTO {
  fecha: string;          // "2025-10-01"
  ingresos: number;       // Cantidad de transacciones (count)
  egresos: number;        // Cantidad de transacciones (count)
  totalIngresos: number;  // Monto total (sum)
  totalEgresos: number;   // Monto total (sum)
}

export interface BalanceGlobalMensualDTO {
  periodo: string; // "2025-10-01"
  totalIngresos: number;
  totalEgresos: number;
  totalIngresosDolar: number;
  totalEgresosDolar: number;
}

export interface ValorDolarDTO {
  fecha: number; // YYYYMMDD
  dia: number;
  mes: number;
  ano: number;
  precio: number;
}