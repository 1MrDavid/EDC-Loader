import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  obtenerCuentas, 
  obtenerMovimientos, 
  obtenerBalanceMensual,
  obtenerFechaMasReciente, // <--- Importamos
  obtenerFlujoDiario
} from "../services/bankingService";
import { type BalanceMensualDTO, type FlujoDiarioDTO } from "../types/finance";

export const useDashboardData = () => {
  // Inicializamos con la fecha actual por defecto (fallback)
  const [page, setPage] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  // 1. Cargar Cuentas
  const cuentasQuery = useQuery({
    queryKey: ["cuentas"],
    queryFn: obtenerCuentas,
  });

  const flujoDiarioQuery = useQuery({
    queryKey: ["flujoDiario", month, year, selectedAccountId],
    queryFn: () => selectedAccountId ? obtenerFlujoDiario(selectedAccountId, month, year) : Promise.resolve([]),
    enabled: !!selectedAccountId, // Solo ejecuta si hay cuenta seleccionada
  });

  // Seleccionar la primera cuenta automáticamente
  useEffect(() => {
    if (cuentasQuery.data && cuentasQuery.data.length > 0 && !selectedAccountId) {
      setSelectedAccountId(cuentasQuery.data[0].id || null);
    }
  }, [cuentasQuery.data]);

  // --- NUEVO: Sincronización de Fecha ---
  // Consultamos la fecha más reciente cada vez que cambia la cuenta seleccionada (o al inicio)
  const fechaRecienteQuery = useQuery({
    queryKey: ["fechaReciente", selectedAccountId],
    queryFn: () => obtenerFechaMasReciente(selectedAccountId || undefined),
    enabled: true, // Siempre intentamos buscar la fecha reciente general o de la cuenta
  });

  // Efecto para actualizar los filtros cuando llega la fecha reciente
  useEffect(() => {
    if (fechaRecienteQuery.data) {
      // La fecha viene como string "2025-10-01"
      // Usamos split para evitar problemas de zona horaria con new Date()
      const [y, m, d] = fechaRecienteQuery.data.split('-').map(Number);
      
      if (y && m) {
        setYear(y);
        setMonth(m);
        setPage(0); // Reiniciamos paginación
      }
    }
  }, [fechaRecienteQuery.data, selectedAccountId]); 
  // Al poner selectedAccountId aquí, forzamos que la UI salte a la última fecha
  // disponible de esa cuenta específica cuando el usuario cambia el dropdown.

  // -------------------------------------

  // 2. Cargar Movimientos (Usando los estados que ahora se auto-actualizan)
  const movimientosQuery = useQuery({
    queryKey: ["movimientos", page, month, year, selectedAccountId], // La key incluye la cuenta, bien.
    queryFn: () => obtenerMovimientos({ 
      page, 
      month, 
      year, 
      //cuentaId: selectedAccountId
    }), 
    placeholderData: (prev) => prev,
    enabled: !!selectedAccountId,
  });

  // 3. Cargar Balance
  const balanceQuery = useQuery({
    queryKey: ["balance", selectedAccountId, month, year],
    queryFn: () => selectedAccountId ? obtenerBalanceMensual(selectedAccountId, month, year) : null,
    enabled: !!selectedAccountId,
  });

  return {
    isLoading: cuentasQuery.isLoading || movimientosQuery.isLoading || flujoDiarioQuery.isLoading,
    cuentas: cuentasQuery.data || [],
    movimientosData: movimientosQuery.data,
    balanceMensual: balanceQuery.data as BalanceMensualDTO | null,

    flujoDiario: flujoDiarioQuery.data || [],
    
    filters: { page, month, year, selectedAccountId },
    actions: { setPage, setMonth, setYear, setSelectedAccountId }
  };
};