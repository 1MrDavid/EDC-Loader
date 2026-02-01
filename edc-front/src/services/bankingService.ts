import { api } from "./api";
import { type BalanceMensualDTO, type PageResponse, type CuentaDTO, type MovimientoDTO, type FlujoDiarioDTO, type BalanceGlobalMensualDTO, type ValorDolarDTO } from "../types/finance";
export const obtenerCuentas = async (): Promise<CuentaDTO[]> => {
  const response = await api.get<CuentaDTO[]>("/cuentas");
  return response.data;
};

interface MovimientoFilters {
  page?: number;
  month?: number; // 1 - 12
  year?: number;
  cuentaId?: number | null;
}

export const obtenerMovimientos = async ({ page = 0, month, year, cuentaId }: MovimientoFilters): Promise<PageResponse<MovimientoDTO>> => {
  // 1. Validar que tengamos mes y año (o usar actuales)
  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  // 2. Calcular inicio y fin de mes para cumplir con el Backend
  // Primer día del mes: YYYY-MM-01
  const inicio = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  
  // Último día del mes:
  // Truco: Día 0 del siguiente mes es el último día del mes actual
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const fin = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDay}`;

  const response = await api.get<PageResponse<MovimientoDTO>>("/movimientos/page", {
    params: { 
      inicio, 
      fin, 
      page, 
      size: 10,
      sort: 'fechaAdd,desc',
      cuentaId
    }, 
  });
  
  return response.data;
};

export const obtenerBalanceMensual = async (cuentaId: number, month: number, year: number): Promise<BalanceMensualDTO | null> => {
  // Formatear fecha al primer día del mes: YYYY-MM-01
  const periodo = `${year}-${month.toString().padStart(2, '0')}-01`;

  try {
    const response = await api.get<BalanceMensualDTO>("/balance-mensual", {
      params: { cuentaId, periodo }
    });
    return response.data;
  } catch (error) {
    // Si no hay balance calculado para ese mes, retornamos null o manejamos el error
    console.warn("No se encontró balance para este periodo");
    return null;
  }
};

export const obtenerFechaMasReciente = async (cuentaId?: number): Promise<string | null> => {
  try {
    // Si cuentaId es null/undefined, axios no enviará el param o lo enviará vacío según config
    // Mejor aseguramos el objeto params:
    const params = cuentaId ? { cuentaId } : {};
    
    const response = await api.get<string>("/movimientos/fecha-mas-reciente", { params });
    return response.data; // Retorna "2025-10-01"
  } catch (error) {
    console.error("No se pudo obtener la fecha reciente", error);
    return null; 
  }
};

export const obtenerFlujoDiario = async (cuentaId: number, month: number, year: number): Promise<FlujoDiarioDTO[]> => {
  // Construimos el periodo: YYYY-MM-01
  const periodo = `${year}-${month.toString().padStart(2, '0')}-01`;
  
  const response = await api.get<FlujoDiarioDTO[]>("/movimientos/flujo-diario", {
    params: { periodo, cuentaId }
  });
  return response.data;
};

// Obtener historial global para el grafico principal
export const obtenerHistorialGlobal = async () => {
  const { data } = await api.get<BalanceGlobalMensualDTO[]>("/balance-mensual/global");
  return data;
};

// Obtener historial del valor del dolar
export const obtenerHistorialDolar = async () => {
  const { data } = await api.get<ValorDolarDTO[]>("/valor-dolar");
  return data;
};