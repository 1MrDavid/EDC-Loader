import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { GlobalTrendChart } from "../components/charts/GlobalTrendChart";
import { AccountCard } from "../components/cards/AccountCard";
import { MovimientosTable } from "../components/tables/MovimientosTable";
import { useHomeData } from "../hooks/useHomeData";

import { crearCuenta } from "../services/bankingService";
import { type CrearCuentaDTO } from "../types/finance";
import { AddAccountModal } from "../components/modals/AddAccountModal";
import { AddAccountCard } from "../components/cards/AddAccountCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SELECT_CLASS =
  "flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const HistorialDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Para invalidar y refrescar la caché
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Usamos el hook que ya tiene la lógica de fechas inteligentes
  const { 
    historialGlobal, 
    cuentas, 
    movimientosData, 
    filters, 
    actions 
  } = useHomeData();

  // MUTATION: Para crear la cuenta
  const crearCuentaMutation = useMutation({
    mutationFn: crearCuenta,
    onSuccess: () => {
      // 1. Refresca la lista de cuentas automáticamente
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      // 2. Cierra el modal
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error al crear cuenta", error);
      alert("Hubo un error al crear la cuenta.");
    }
  });

  const handleCrearCuenta = (data: CrearCuentaDTO) => {
    crearCuentaMutation.mutate(data);
  };

  // Generador de años para el select
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Visión General</h1>
        <p className="text-sm text-muted-foreground">Resumen consolidado de todas tus cuentas bancarias.</p>
      </div>

      <section>
        <GlobalTrendChart data={historialGlobal} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">Tus Cuentas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(cuentas) && cuentas.map(cuenta => (
            <AccountCard 
              key={cuenta.id} 
              cuenta={cuenta} 
              onClick={() => navigate(`/cuenta/${cuenta.id}`)}
            />
          ))}

          <AddAccountCard onClick={() => setIsModalOpen(true)} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Movimientos Recientes (Global)</CardTitle>
            <CardDescription>Mostrando actividad consolidada.</CardDescription>
          </div>

          <div className="flex gap-2">
            <select 
              value={filters.month} 
              onChange={(e) => {
                 actions.setMonth(Number(e.target.value));
                 actions.setPage(0); // Reset página al cambiar mes
              }}
              className={SELECT_CLASS}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString('es', {month: 'long'})}
                </option>
              ))}
            </select>

            <select 
              value={filters.year} 
              onChange={(e) => {
                actions.setYear(Number(e.target.value));
                actions.setPage(0);
              }}
              className={SELECT_CLASS}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <MovimientosTable 
            data={movimientosData?.content || []} 
            currentPage={filters.page}
            totalPages={movimientosData?.totalPages || 1}
            onPageChange={actions.setPage}
          />
        </CardContent>
      </Card>

      <AddAccountModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCrearCuenta}
        isLoading={crearCuentaMutation.isPending}
      />
    </div>
  );
};
