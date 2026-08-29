import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerDeudasActivas, obtenerPagosDeuda, crearDeuda, actualizarDeuda, eliminarPagoDeuda } from "../services/bankingService";
import { type ActualizarDeudaDTO, type CrearDeudaDTO, type DeudaDTO } from "../types/finance";
import { AddDeudaModal } from "../components/modals/AddDeudaModal";
import { CategoryBadge } from "../components/cards/CategoryBadge";

export const DeudasPage = () => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deudaEditando, setDeudaEditando] = useState<DeudaDTO | null>(null);
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const { data: deudas = [], isLoading: loadingDeudas } = useQuery({
    queryKey: ["deudas", month, year],
    queryFn: () => obtenerDeudasActivas(month, year),
  });

  const { data: pagos = [], isLoading: loadingPagos } = useQuery({
    queryKey: ["pagos-deuda", month, year],
    queryFn: () => obtenerPagosDeuda(month, year),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setDeudaEditando(null);
  };

  const openCreateModal = () => {
    setDeudaEditando(null);
    setIsModalOpen(true);
  };

  const openEditModal = (deuda: DeudaDTO) => {
    setDeudaEditando(deuda);
    setIsModalOpen(true);
  };

  const crearDeudaMutation = useMutation({
    mutationFn: crearDeuda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Error al crear deuda", error);
      alert("Hubo un error al crear la deuda.");
    },
  });

  const actualizarDeudaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarDeudaDTO }) =>
      actualizarDeuda(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Error al actualizar deuda", error);
      alert("Hubo un error al actualizar la deuda.");
    },
  });

  const eliminarPagoMutation = useMutation({
    mutationFn: eliminarPagoDeuda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
    },
  });

  const handleSubmitDeuda = (data: CrearDeudaDTO | ActualizarDeudaDTO) => {
    if (deudaEditando) {
      actualizarDeudaMutation.mutate({ id: deudaEditando.id, data: data as ActualizarDeudaDTO });
    } else {
      crearDeudaMutation.mutate(data as CrearDeudaDTO);
    }
  };

  const isSaving = crearDeudaMutation.isPending || actualizarDeudaMutation.isPending;

  const deudasPagadas = deudas.filter((d) => d.pagadoEstePeriodo).length;
  const deudasPendientes = deudas.length - deudasPagadas;
  const montoPagadoUsd = deudas.filter((d) => d.pagadoEstePeriodo).reduce((acc, curr) => acc + curr.montoEquivalenteUsd, 0);
  const montoPendienteUsd = deudas.filter((d) => !d.pagadoEstePeriodo).reduce((acc, curr) => acc + curr.montoEquivalenteUsd, 0);

  return (
    // 1. EL CONTENEDOR PADRE AHORA ESTÁ BLOQUEADO EN ALTURA (overflow-hidden)
    <div className="bg-slate-50 flex -m-8 h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* 2. EL ASIDE (PANEL IZQUIERDO) TIENE SU PROPIO SCROLL INTERNO EN LA LISTA */}
      <aside className="w-full lg:w-1/3 max-w-sm border-r border-slate-200 bg-slate-50/50 p-6 flex flex-col h-full">
        <div className="mb-6 flex justify-between items-start gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deudas y Suscripciones</h1>
            <p className="text-slate-500 text-sm">Control de pagos recurrentes y cuotas.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="shrink-0 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            + Nueva
          </button>
        </div>

        {/* CONTENEDOR CON SCROLL PARA LAS TARJETAS DE DEUDAS */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10">
          {loadingDeudas ? (
            <div className="text-center text-slate-400 py-10 animate-pulse">Cargando deudas...</div>
          ) : deudas.length === 0 ? (
            <div className="text-center text-slate-400 py-10">No hay deudas activas.</div>
          ) : (
            deudas.map((deuda) => (
              <div
                key={deuda.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all relative overflow-hidden ${deuda.pagadoEstePeriodo ? "border-emerald-200 shadow-emerald-50" : "border-slate-200"}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: deuda.color }}></div>

                <div className="flex justify-between items-start mb-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{deuda.icono}</span>
                    <h3
                      onClick={() => openEditModal(deuda)}
                      className="font-bold text-slate-800 leading-tight cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                      title="Click para editar"
                    >
                      {deuda.nombre}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${deuda.pagadoEstePeriodo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {deuda.pagadoEstePeriodo ? "Pagado" : "Pendiente"}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-4 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">
                  Tipo: {deuda.tipoDeuda === "CICLICA" ? "Cíclico" : "Definido"}{" "}
                  {deuda.frecuencia !== "UNA_VEZ" && `(${deuda.frecuencia.toLowerCase()})`}
                </div>

                {deuda.tipoDeuda === "CICLICA" ? (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Monto USD:</span>
                      <span className="font-bold text-slate-700">${deuda.montoEquivalenteUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Monto Bs:</span>
                      <span className="font-bold text-slate-700">
                        Bs. {deuda.montoEquivalenteBs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 border-t border-dashed border-slate-200 pt-3 mt-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total USD:</span>
                      <span className="font-bold text-slate-700">${deuda.montoEquivalenteUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Abonado USD:</span>
                      <span className="font-bold text-emerald-600">${deuda.montoAbonadoUsd?.toFixed(2) || "0.00"}</span>
                    </div>
                    {deuda.cuotasTotales && (
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                          <span>Cuotas Pagadas: {deuda.cuotasPagadas}</span>
                          <span>De: {deuda.cuotasTotales}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(deuda.cuotasPagadas / deuda.cuotasTotales) * 100}%`,
                              backgroundColor: deuda.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 3. EL MAIN (PANEL DERECHO) AHORA TIENE SU PROPIO SCROLL */}
      <main className="flex-1 p-8 h-full overflow-y-auto custom-scrollbar">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 shrink-0">
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-slate-200 shadow-sm cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-slate-200 shadow-sm cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monto Pagado</span>
              <span className="text-lg font-bold text-emerald-600">
                ${montoPagadoUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monto Pendiente</span>
              <span className="text-lg font-bold text-rose-600">
                ${montoPendienteUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deudas Pagadas</span>
              <span className="text-lg font-bold text-slate-800">{deudasPagadas}</span>
            </div>
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deudas Pendientes</span>
              <span className="text-lg font-bold text-slate-800">{deudasPendientes}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Historial de Pagos de Deudas</h2>
            <p className="text-xs text-slate-400">Registros abonados en el período seleccionado.</p>
          </div>

          {loadingPagos ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">Cargando pagos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Deuda & Fecha</th>
                    <th className="px-6 py-4">Detalle</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-right">Monto (Bs / $)</th>
                    <th className="px-6 py-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No hay pagos registrados en este período.
                      </td>
                    </tr>
                  ) : (
                    pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className="flex items-center gap-2 font-semibold text-slate-700">
                            <span>{pago.deudaIcono || "💳"}</span>
                            {pago.deudaNombre || "Deuda desconocida"}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">{pago.fechaPago}</span>
                          <span className="block text-xs text-slate-400 font-mono mt-0.5">ID: {pago.id}</span>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: pago.deudaColor || "#64748b" }}
                          ></span>
                          <span className="text-slate-600">
                            Pago {pago.origen === 'AUTO' ? 'automático' : 'manual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {pago.categoria ? (
                            <CategoryBadge categoria={pago.categoria} />
                          ) : (
                            <span className="text-xs text-slate-400">Sin categoría</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="block text-sm font-bold text-rose-600">
                            -{(pago.montoPagadoBs ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                          </span>
                          <span className="block text-xs font-medium mt-0.5 text-rose-400">
                            -${(pago.montoPagadoUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar pago de ${pago.deudaNombre}?`)) {
                                eliminarPagoMutation.mutate(pago.id);
                              }
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AddDeudaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitDeuda}
        isLoading={isSaving}
        deuda={deudaEditando}
      />
    </div>
  );
};