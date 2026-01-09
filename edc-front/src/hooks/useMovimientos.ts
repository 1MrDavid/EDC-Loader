import { useQuery } from "@tanstack/react-query";
import { obtenerMovimientos } from "../services/bankingService";
import { type MovimientoDTO } from "../types/finance";

export const useMovimientos = () => {
  return useQuery<MovimientoDTO[]>({
    queryKey: ["movimientos"],
    queryFn: obtenerMovimientos,
  });
};
