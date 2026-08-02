import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerRegistrosPendientes, marcarRegistroProcesado } from "../services/bankingService";
import { type RegistroBotDTO } from "../types/finance";

export const useBotRecords = () => {
  const queryClient = useQueryClient();

  // Traer los datos en vivo
  const query = useQuery<RegistroBotDTO[]>({
    queryKey: ["bot-records"],
    queryFn: obtenerRegistrosPendientes,
    refetchInterval: 30000, // Opcional: Refresca automáticamente cada 30 seg
  });

  // Mutación para procesar/descartar manualmente si lo necesitas
  const mutation = useMutation({
    mutationFn: marcarRegistroProcesado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
    },
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    markAsProcessed: mutation.mutate,
    isMarking: mutation.isPending
  };
};