export interface CuentaDTO {
  id?: number;
  numero: string;
  cuenta: string;
}

export interface CategoriaResumenDTO {
  id: number;
  nombre: string;
  color: string;
  icono: string;
}

export interface MovimientoDTO {
  id: number;
  cuentaId: number;
  fechaAdd: string;
  fechavalor: string | null;
  fechaefec: string | null;
  referencia: string | null;
  descripcion: string;

  beneficiario: string | null;
  identificacion: string | null;
  telefono: string | null;
  bancoDestino: string | null;

  egreso: number | null;
  ingreso: number | null;
  saldo: number | null;

  ingresodolar: number | null;
  egresodolar: number | null;
  saldodolar: number | null;
  tasadolar: number | null;

  categoria: CategoriaResumenDTO | null;
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

export interface CrearCuentaDTO {
  numero: string;
  banco: string;
}

export interface CategoriaResumenMesDTO {
  id: number;
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
  color: string;
  icono: string;
  movimientosMes: number;
  montoTotalDolar: number; // El valor que viene del back
}

export interface CrearCategoriaDTO {
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
  color: string;
  icono: string;
}

export interface ActualizarCategoriaDTO {
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
  color: string;
  icono: string;
}

export interface CategoriaDTO {
  id: number;
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
  color: string;
  icono: string;
  activa: boolean;
}

export interface CrearReglaDTO {
  patron: string;
  tipoPatron: "CONCEPTO" | "BENEFICIARIO" | "REFERENCIA" | "DESCRIPCION";
  categoriaId: number;
}

export interface ReglaDTO {
  id: number;
  patron: string;
  tipoPatron: string;
  categoriaId: number;
  activa: boolean;
  movimientosActualizados: number;
  registrosBotActualizados: number;
}

export interface RegistroBotDTO {
  id: number;
  tipo: string;
  monto: number;
  referencia: string | null;
  fecha: string;
  bancoOrigen: string | null;
  bancoDestino: string | null;
  beneficiario: string | null;
  telefono: string | null;
  identificacion: string | null;
  concepto: string | null;
  procesado: boolean;
  fechaCreacion: string;
  categoria: CategoriaResumenDTO | null;
  esIngreso: boolean;
  montoDolar: number | null;
  pagoDeudaId: number | null;
  deudaId: number | null;
  deudaNombre: string | null;
}

export interface CrearDeudaDTO {
  nombre: string;
  tipoDeuda: 'CICLICA' | 'DEFINIDA';
  frecuencia: string;
  montoBs?: number | null;
  montoUsd?: number | null;
  montoEur?: number | null;
  categoriaId?: number | null;
  crearCategoriaDedicada?: boolean;
  fechaInicio: string;
  fechaFin?: string | null;
  color: string;
  icono: string;
  cuotasTotales?: number | null;
}

export interface ActualizarDeudaDTO extends CrearDeudaDTO {
  activa: boolean;
}

export interface DeudaDTO {
  id: number;
  nombre: string;
  tipoDeuda: 'CICLICA' | 'DEFINIDA';
  frecuencia: string;
  montoBs: number | null;
  montoUsd: number | null;
  montoEur: number | null;
  montoEquivalenteBs: number;
  montoEquivalenteUsd: number;
  pagadoEstePeriodo: boolean;
  categoria: CategoriaResumenDTO | null;
  fechaInicio: string;
  fechaFin: string | null;
  activa: boolean;
  color: string;
  icono: string;
  cuotasTotales: number | null;
  cuotasPagadas: number;
  montoAbonadoBs: number;
  montoAbonadoUsd: number;
}

export interface PagoDeudaDTO {
  id: number;
  montoPagadoBs: number | null;
  montoPagadoUsd: number | null;
  fechaPago: string;
  deudaNombre: string | null;
  deudaIcono: string | null;
  deudaColor: string | null;
  categoria: CategoriaResumenDTO | null;
  deudaId: number | null;
  registroBotId: number | null;
  movimientoId: number | null;
  origen: string | null;
}

export interface RegistrarPagoDeudaDTO {
  deudaId: number;
  registroBotId?: number | null;
  movimientoId?: number | null;
  fechaPago: string;
  montoPagadoBs?: number | null;
  montoPagadoUsd?: number | null;
  origen?: 'AUTO' | 'MANUAL' | 'BILLETERA';
  cuentaAhorroId?: number | null;
}

export interface MetaAhorroDTO {
  id: number;
  nombre: string;
  cuentaAhorroId: number;
  cuentaAhorroNombre: string | null;
  montoObjetivoUsd: number;
  fechaLimite: string | null;
  activa: boolean;
  saldoActualUsd: number;
  porcentajeAvance: number;
  mesesEstimadosRestantes: number;
}

export interface CrearMetaDTO {
  nombre: string;
  cuentaAhorroId: number;
  montoObjetivoUsd: number;
  fechaLimite?: string | null;
}

export interface ActualizarMetaDTO extends CrearMetaDTO {
  activa: boolean;
}

export type LimiteEstado = 'SAFE' | 'WARNING' | 'DANGER';

export interface LimiteCategoriaDTO {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  categoriaColor: string;
  categoriaIcono: string;
  limiteUsd: number;
  gastadoUsd: number;
  porcentajeConsumo: number;
  estado: LimiteEstado;
  mes: number | null;
  ano: number | null;
  global: boolean;
}

export interface CrearLimiteDTO {
  categoriaId: number;
  montoUsd: number;
  mes?: number | null;
  ano?: number | null;
}

export interface ActualizarLimiteDTO extends CrearLimiteDTO {
  activa: boolean;
}

export interface CuentaAhorroDTO {
  id: number;
  nombre: string;
  tipoMoneda: string;
  saldoActual: number;
  saldoEquivalenteBs: number;
  saldoEquivalenteUsd: number;
  color: string;
  icono: string;
}

export interface CrearCuentaAhorroDTO {
  nombre: string;
  tipoMoneda: string;
  saldoInicial?: number | null;
  color: string;
  icono: string;
}

export interface ActualizarCuentaAhorroDTO {
  nombre: string;
  tipoMoneda: string;
  color: string;
  icono: string;
}

export interface MovimientoAhorroDTO {
  id: number;
  cuentaAhorroId: number;
  tipoOperacion: 'INGRESO' | 'EGRESO';
  monto: number;
  descripcion: string | null;
  fecha: string;
  movimientoId: number | null;
  registroBotId: number | null;
  categoriaId?: number | null;
  categoriaNombre?: string | null;
  categoriaColor?: string | null;
  categoriaIcono?: string | null;
  deudaId?: number | null;
  deudaNombre?: string | null;
}

export interface CrearMovimientoAhorroDTO {
  cuentaAhorroId: number;
  tipoOperacion: 'INGRESO' | 'EGRESO';
  monto: number;
  descripcion?: string | null;
  fecha: string;
  categoriaId?: number | null;
  deudaId?: number | null;
}