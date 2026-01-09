import { api } from "./api";
import { type CargaArchivoResponseDTO } from "../types/finance";

export const subirEstadoCuenta = async (archivo: File, cuentaId: number): Promise<CargaArchivoResponseDTO> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("cuentaId", cuentaId.toString());

  // Axios detecta automáticamente el FormData y ajusta el Content-Type a multipart/form-data
  const response = await api.post<CargaArchivoResponseDTO>("/cargas/estado-cuenta", formData);
  return response.data;
};