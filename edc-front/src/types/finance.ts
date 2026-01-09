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