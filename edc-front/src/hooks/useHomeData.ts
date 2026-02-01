import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  obtenerCuentas, 
  obtenerHistorialGlobal, 
  obtenerMovimientos,
  obtenerFechaMasReciente // Reutilizamos este servicio
} from "../services/bankingService";

export const useHomeData = () => {
  // Estado inicial (se actualizará solo)
  const [page, setPage] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // 1. Obtener la fecha más reciente GLOBAL (sin pasar cuentaId)
  const fechaRecienteQuery = useQuery({
    queryKey: ["fechaRecienteGlobal"],
    queryFn: () => obtenerFechaMasReciente(), // Sin argumentos = Global
  });

  // 2. Efecto para sincronizar el calendario con la última data disponible
  useEffect(() => {
    if (fechaRecienteQuery.data) {
      const [y, m] = fechaRecienteQuery.data.split('-').map(Number);
      if (y && m) {
        setYear(y);
        setMonth(m);
      }
    }
  }, [fechaRecienteQuery.data]);

  // 3. Cargar Movimientos Globales usando el mes/año dinámicos
  const movimientosQuery = useQuery({
    queryKey: ["movimientosGlobales", page, month, year],
    queryFn: () => obtenerMovimientos({ 
      page, 
      month, 
      year, 
      cuentaId: null // null para traer de todos los bancos
    }),
    placeholderData: (prev) => prev,
  });

  // 4. Datos estáticos del Home (Gráfico y Cuentas)
  const historialQuery = useQuery({
    queryKey: ["historialGlobal"],
    queryFn: obtenerHistorialGlobal
  });

  const cuentasQuery = useQuery({
    queryKey: ["cuentas"],
    queryFn: obtenerCuentas
  });

  return {
    isLoading: movimientosQuery.isLoading || historialQuery.isLoading,
    historialGlobal: historialQuery.data || [],
    cuentas: cuentasQuery.data || [],
    movimientosData: movimientosQuery.data,
    
    // Filtros y Acciones para la UI
    filters: { page, month, year },
    actions: { setPage, setMonth, setYear }
  };
};