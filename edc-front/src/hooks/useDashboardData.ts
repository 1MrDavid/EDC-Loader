import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerCuentas, obtenerMovimientos } from "../services/bankingService";

export const useDashboardData = () => {
  // Estados para filtros
  const [page, setPage] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());

  // Query de Cuentas (No cambia con paginación)
  const cuentasQuery = useQuery({
    queryKey: ["cuentas"],
    queryFn: obtenerCuentas,
  });

  // Query de Movimientos (Depende de page, month, year)
  const movimientosQuery = useQuery({
    queryKey: ["movimientos", page, month, year], // Clave compuesta
    queryFn: () => obtenerMovimientos({ page, month, year }),
    placeholderData: (prev) => prev, // Mantiene los datos viejos mientras carga los nuevos (mejor UX)
  });

  // Calculo de saldos (Nota: idealmente el backend debería dar un endpoint de resumen de saldos aparte)
  // Pero manteniendo tu lógica actual:
  const movimientos = movimientosQuery.data?.content || [];
  const ultimoMov = movimientos[0]; // Como ahora es DESC, el indice 0 es el más reciente

  return {
    isLoading: cuentasQuery.isLoading || movimientosQuery.isLoading,
    cuentas: cuentasQuery.data || [],
    movimientosData: movimientosQuery.data, // Objeto completo PageResponse
    saldoUSD: ultimoMov?.saldodolar || 0,
    saldoBS: ultimoMov?.saldo || 0,
    filters: { page, month, year },
    actions: { setPage, setMonth, setYear }
  };
};