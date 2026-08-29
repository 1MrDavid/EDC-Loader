import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  obtenerCuentasAhorro,
  obtenerMovimientosAhorro,
  crearCuentaAhorro,
  actualizarCuentaAhorro,
  eliminarCuentaAhorro,
  registrarMovimientoAhorro,
  eliminarMovimientoAhorro,
} from "../services/bankingService";
import {
  type ActualizarCuentaAhorroDTO,
  type CrearCuentaAhorroDTO,
  type CuentaAhorroDTO,
} from "../types/finance";
import { AddCuentaAhorroModal } from "../components/modals/AddCuentaAhorroModal";
import { AddMovimientoAhorroModal } from "../components/modals/AddMovimientoAhorroModal";

export const CuentasAhorroPage = () => {
  const queryClient = useQueryClient();
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null);
  const [isCuentaModalOpen, setIsCuentaModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<CuentaAhorroDTO | null>(null);

  const { data: cuentas = [], isLoading: loadingCuentas } = useQuery({
    queryKey: ["cuentas-ahorro"],
    queryFn: obtenerCuentasAhorro,
  });

  const { data: movimientos = [], isLoading: loadingMovimientos } = useQuery({
    queryKey: ["movimientos-ahorro", cuentaSeleccionada],
    queryFn: () => obtenerMovimientosAhorro(cuentaSeleccionada!),
    enabled: !!cuentaSeleccionada,
  });

  useEffect(() => {
    if (cuentas.length > 0 && cuentaSeleccionada === null) {
      setCuentaSeleccionada(cuentas[0].id);
    }
  }, [cuentas, cuentaSeleccionada]);

  const closeCuentaModal = () => {
    setIsCuentaModalOpen(false);
    setCuentaEditando(null);
  };

  const crearCuentaMutation = useMutation({
    mutationFn: crearCuentaAhorro,
    onSuccess: (nueva) => {
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
      setCuentaSeleccionada(nueva.id);
      closeCuentaModal();
    },
    onError: () => alert("Error al crear la billetera."),
  });

  const actualizarCuentaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarCuentaAhorroDTO }) =>
      actualizarCuentaAhorro(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      closeCuentaModal();
    },
    onError: () => alert("Error al actualizar la billetera."),
  });

  const eliminarCuentaMutation = useMutation({
    mutationFn: eliminarCuentaAhorro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
      setCuentaSeleccionada(null);
    },
    onError: (error: Error) => {
      alert(error.message || "No se pudo eliminar la billetera.");
    },
  });

  const registrarMovimientoMutation = useMutation({
    mutationFn: registrarMovimientoAhorro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
      setIsMovimientoModalOpen(false);
    },
    onError: (error: Error) => {
      alert(error.message || "Error al registrar el movimiento.");
    },
  });

  const eliminarMovimientoMutation = useMutation({
    mutationFn: eliminarMovimientoAhorro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
    },
    onError: () => alert("Error al eliminar el movimiento."),
  });

  const handleSubmitCuenta = (data: CrearCuentaAhorroDTO | ActualizarCuentaAhorroDTO) => {
    if (cuentaEditando) {
      actualizarCuentaMutation.mutate({ id: cuentaEditando.id, data: data as ActualizarCuentaAhorroDTO });
    } else {
      crearCuentaMutation.mutate(data as CrearCuentaAhorroDTO);
    }
  };

  const cuentaActiva = cuentas.find((c) => c.id === cuentaSeleccionada);
  const capitalTotalUsd = cuentas.reduce((acc, c) => acc + c.saldoEquivalenteUsd, 0);
  const isSavingCuenta = crearCuentaMutation.isPending || actualizarCuentaMutation.isPending;

  return (
    <div className="bg-slate-50 min-h-screen p-8 -m-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ahorros y Billeteras</h1>
          <p className="text-slate-500 text-sm">Gestión de liquidez, divisas y cuentas de ahorro.</p>
        </div>
        <button
          onClick={() => {
            setCuentaEditando(null);
            setIsCuentaModalOpen(true);
          }}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          + Nueva Billetera
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row gap-8 items-center">
        <div className="w-full lg:w-1/3 space-y-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Patrimonio Líquido Total</h3>
          <p className="text-4xl font-bold text-slate-800">
            ${capitalTotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <span>↑</span> Distribuido en {cuentas.length} cuentas
          </p>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col gap-3 border-l border-slate-100 pl-8">
          <h4 className="text-xs font-bold text-slate-500 uppercase">Distribución de Capital</h4>
          {cuentas.map((cuenta) => {
            const porcentaje = capitalTotalUsd > 0 ? (cuenta.saldoEquivalenteUsd / capitalTotalUsd) * 100 : 0;
            return (
              <div key={`chart-${cuenta.id}`} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-slate-600 truncate">{cuenta.nombre}</span>
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${porcentaje}%`, backgroundColor: cuenta.color }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-bold text-slate-400">{porcentaje.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-800">Tus Cuentas</h3>
          {cuentaActiva && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCuentaEditando(cuentaActiva);
                  setIsCuentaModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar la billetera "${cuentaActiva.nombre}"?`)) {
                    eliminarCuentaMutation.mutate(cuentaActiva.id);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        <div className="flex overflow-x-auto pb-4 gap-4 custom-scrollbar snap-x">
          {loadingCuentas ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[280px] h-32 bg-white border border-slate-200 rounded-2xl animate-pulse shrink-0" />
              ))}
            </div>
          ) : cuentas.length === 0 ? (
            <div className="p-8 text-slate-400 text-sm">No hay billeteras registradas. Crea la primera.</div>
          ) : (
            cuentas.map((cuenta) => {
              const isSelected = cuentaSeleccionada === cuenta.id;
              return (
                <div
                  key={cuenta.id}
                  onClick={() => setCuentaSeleccionada(cuenta.id)}
                  className={`min-w-[280px] shrink-0 snap-start p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                    ${isSelected
                      ? "bg-slate-900 border-slate-900 shadow-md text-white"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800"
                    }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: cuenta.color }} />

                  <div className="flex justify-between items-start mb-4 ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl bg-white/10 p-1.5 rounded-lg">{cuenta.icono}</span>
                      <div>
                        <h4 className="font-bold text-sm leading-none">{cuenta.nombre}</h4>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Cuenta en {cuenta.tipoMoneda}
                        </span>
                      </div>
                    </div>
                    {isSelected && <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">Activa</span>}
                  </div>

                  <div className="ml-2">
                    <p className={`text-2xl font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>
                      {cuenta.tipoMoneda === "Bs" ? "Bs. " : "$"}
                      {cuenta.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs mt-1 ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                      ≈ ${cuenta.saldoEquivalenteUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Historial de Movimientos</h2>
            <p className="text-xs text-slate-500">
              Mostrando actividad de:{" "}
              <span className="font-bold text-slate-700">{cuentaActiva?.nombre || "Seleccione una cuenta"}</span>
            </p>
          </div>
          <button
            onClick={() => setIsMovimientoModalOpen(true)}
            disabled={!cuentaSeleccionada}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            + Registrar Movimiento
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loadingMovimientos && cuentaSeleccionada ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">Cargando movimientos...</div>
          ) : !cuentaSeleccionada ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <span className="text-4xl mb-3">👆</span>
              Selecciona una tarjeta arriba para ver sus movimientos
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Concepto / Descripción</th>
                  <th className="px-6 py-4">Operación</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay movimientos registrados en esta cuenta.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((mov) => {
                    const isIngreso = mov.tipoOperacion === "INGRESO";
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block text-sm font-semibold text-slate-700">{mov.fecha}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">ID: {mov.id}</span>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <span className="block text-sm text-slate-700 font-medium truncate">
                            {mov.descripcion || "Sin descripción"}
                          </span>
                          {mov.registroBotId && (
                            <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">
                              Vinculado a Bot
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                              isIngreso ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isIngreso ? "↓ Ingreso" : "↑ Egreso"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className={`block text-sm font-bold ${isIngreso ? "text-emerald-600" : "text-slate-800"}`}>
                            {isIngreso ? "+" : "-"}
                            {mov.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm("¿Eliminar este movimiento? Se revertirá el saldo.")) {
                                eliminarMovimientoMutation.mutate(mov.id);
                              }
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <AddCuentaAhorroModal
        isOpen={isCuentaModalOpen}
        onClose={closeCuentaModal}
        onSubmit={handleSubmitCuenta}
        isLoading={isSavingCuenta}
        cuenta={cuentaEditando}
      />

      {cuentaActiva && (
        <AddMovimientoAhorroModal
          isOpen={isMovimientoModalOpen}
          onClose={() => setIsMovimientoModalOpen(false)}
          onSubmit={(data) => registrarMovimientoMutation.mutate(data)}
          isLoading={registrarMovimientoMutation.isPending}
          cuentaAhorroId={cuentaActiva.id}
          cuentaNombre={cuentaActiva.nombre}
        />
      )}
    </div>
  );
};
