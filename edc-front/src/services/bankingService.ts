import { api } from "./api";
import { type PageResponse, type CuentaDTO, type MovimientoDTO } from "../types/finance";

export const obtenerCuentas = async (): Promise<CuentaDTO[]> => {
  const response = await api.get<CuentaDTO[]>("/cuentas");
  return response.data;
};

interface MovimientoFilters {
  page?: number;
  month?: number; // 1 - 12
  year?: number;
}

export const obtenerMovimientos = async ({ page = 0, month, year }: MovimientoFilters): Promise<PageResponse<MovimientoDTO>> => {
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
      sort: 'fechaAdd,desc'
    }, 
  });
  
  return response.data;
};