import { useQuery } from "@tanstack/react-query";
import { obtenerCuentas } from "../services/bankingService";
import { type CuentaDTO } from "../types/finance";

export const useCuentas = () => {
  return useQuery<CuentaDTO[]>({
    queryKey: ["cuentas"],
    queryFn: obtenerCuentas,
  });
};
