import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  obtenerMetas,
  obtenerLimites,
  crearMeta,
  actualizarMeta,
  eliminarMeta,
  crearLimite,
  actualizarLimite,
  eliminarLimite,
} from "../services/bankingService";
import {
  type ActualizarLimiteDTO,
  type ActualizarMetaDTO,
  type CrearLimiteDTO,
  type CrearMetaDTO,
  type LimiteCategoriaDTO,
  type LimiteEstado,
  type MetaAhorroDTO,
} from "../types/finance";
import { AddMetaModal } from "../components/modals/AddMetaModal";
import { AddLimiteModal } from "../components/modals/AddLimiteModal";

export const AhorrosLimitesPage = () => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isLimiteModalOpen, setIsLimiteModalOpen] = useState(false);
  const [metaEditando, setMetaEditando] = useState<MetaAhorroDTO | null>(null);
  const [limiteEditando, setLimiteEditando] = useState<LimiteCategoriaDTO | null>(null);

  const { data: metas = [], isLoading: loadingMetas } = useQuery({
    queryKey: ["metas-ahorro"],
    queryFn: obtenerMetas,
  });

  const { data: limites = [], isLoading: loadingLimites } = useQuery({
    queryKey: ["limites-categoria", month, year],
    queryFn: () => obtenerLimites(month, year),
  });

  const closeMetaModal = () => {
    setIsMetaModalOpen(false);
    setMetaEditando(null);
  };

  const closeLimiteModal = () => {
    setIsLimiteModalOpen(false);
    setLimiteEditando(null);
  };

  const crearMetaMutation = useMutation({
    mutationFn: crearMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
      closeMetaModal();
    },
    onError: () => alert("Error al crear la meta."),
  });

  const actualizarMetaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarMetaDTO }) => actualizarMeta(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
      closeMetaModal();
    },
    onError: () => alert("Error al actualizar la meta."),
  });

  const eliminarMetaMutation = useMutation({
    mutationFn: eliminarMeta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] }),
    onError: () => alert("Error al eliminar la meta."),
  });

  const crearLimiteMutation = useMutation({
    mutationFn: crearLimite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites-categoria"] });
      closeLimiteModal();
    },
    onError: () => alert("Error al crear el límite. Verifica que no exista uno para esa categoría y período."),
  });

  const actualizarLimiteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarLimiteDTO }) => actualizarLimite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites-categoria"] });
      closeLimiteModal();
    },
    onError: () => alert("Error al actualizar el límite."),
  });

  const eliminarLimiteMutation = useMutation({
    mutationFn: eliminarLimite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["limites-categoria"] }),
    onError: () => alert("Error al eliminar el límite."),
  });

  const handleSubmitMeta = (data: CrearMetaDTO | ActualizarMetaDTO) => {
    if (metaEditando) {
      actualizarMetaMutation.mutate({ id: metaEditando.id, data: data as ActualizarMetaDTO });
    } else {
      crearMetaMutation.mutate(data as CrearMetaDTO);
    }
  };

  const handleSubmitLimite = (data: CrearLimiteDTO | ActualizarLimiteDTO) => {
    if (limiteEditando) {
      actualizarLimiteMutation.mutate({ id: limiteEditando.id, data: data as ActualizarLimiteDTO });
    } else {
      crearLimiteMutation.mutate(data as CrearLimiteDTO);
    }
  };

  const isSavingMeta = crearMetaMutation.isPending || actualizarMetaMutation.isPending;
  const isSavingLimite = crearLimiteMutation.isPending || actualizarLimiteMutation.isPending;

  const getStatusColors = (estado: LimiteEstado) => {
    switch (estado) {
      case "DANGER":
        return { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", lightBg: "bg-rose-50" };
      case "WARNING":
        return { bg: "bg-amber-400", text: "text-amber-600", border: "border-amber-200", lightBg: "bg-amber-50" };
      case "SAFE":
      default:
        return { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-slate-200", lightBg: "bg-white" };
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8 -m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ahorros y Límites</h1>
          <p className="text-slate-500 text-sm">Control de presupuestos mensuales y metas a largo plazo.</p>
        </div>

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
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* METAS DE AHORRO */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-800">Metas de Ahorro</h3>
          <button
            onClick={() => {
              setMetaEditando(null);
              setIsMetaModalOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            + Nueva Meta
          </button>
        </div>

        {loadingMetas ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-pulse flex flex-col gap-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
          </div>
        ) : metas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-400">
            No hay metas de ahorro activas. Crea una para empezar a medir tu progreso.
          </div>
        ) : (
          <div className="space-y-4">
            {metas.map((meta) => (
              <div key={meta.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                <div className="flex justify-between items-start mb-4 ml-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{meta.nombre}</h2>
                    {meta.cuentaAhorroNombre && (
                      <p className="text-xs text-slate-500 mt-1">Vinculada a: {meta.cuentaAhorroNombre}</p>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Monto Actual vs. Meta</span>
                      <p className="text-lg font-bold text-slate-800">
                        ${meta.saldoActualUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                        <span className="text-slate-400 font-normal">
                          / ${meta.montoObjetivoUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setMetaEditando(meta);
                          setIsMetaModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la meta "${meta.nombre}"?`)) {
                            eliminarMetaMutation.mutate(meta.id);
                          }
                        }}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ml-2 mb-3">
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${Math.min(meta.porcentajeAvance, 100)}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-blue-600">
                      Porcentaje completado: {meta.porcentajeAvance.toFixed(1)}%
                    </span>
                    <span className="text-slate-500 italic">
                      {meta.mesesEstimadosRestantes > 0
                        ? `Al ritmo actual, alcanzarás la meta en aprox. ${meta.mesesEstimadosRestantes} meses`
                        : meta.fechaLimite
                          ? "Meta con fecha límite definida"
                          : "¡Sigue ahorrando para calcular un estimado!"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LÍMITES DE GASTO */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-800">Presupuestos por Categoría</h3>
          <button
            onClick={() => {
              setLimiteEditando(null);
              setIsLimiteModalOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            + Nuevo Límite
          </button>
        </div>

        {loadingLimites ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : limites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-400">
            No tienes límites presupuestarios configurados para este mes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {limites.map((limite) => {
              const colors = getStatusColors(limite.estado);
              const isOverLimit = limite.gastadoUsd > limite.limiteUsd;
              const surplus = Math.abs(limite.limiteUsd - limite.gastadoUsd);

              return (
                <div key={limite.id} className={`rounded-2xl border p-5 shadow-sm transition-all ${colors.border} ${colors.lightBg}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{limite.categoriaIcono}</span>
                      <div>
                        <h4 className="font-bold text-slate-800">{limite.categoriaNombre}</h4>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {limite.global ? "Límite global" : `Mes ${limite.mes}/${limite.ano}`}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${colors.text} bg-white/60`}>
                      {limite.porcentajeConsumo.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
                      <div
                        className={`${colors.bg} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(limite.porcentajeConsumo, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-end text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-500">
                        Límite: <span className="font-semibold text-slate-700">${limite.limiteUsd.toFixed(2)}</span>
                      </p>
                      <p className="text-slate-500">
                        Gastado: <span className="font-semibold text-slate-700">${limite.gastadoUsd.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {limite.estado === "DANGER" ? (
                        <div className="text-right text-xs font-bold text-rose-600 flex items-center gap-1">
                          <span>⚠️</span>
                          {isOverLimit ? `Excedido por $${surplus.toFixed(2)}` : `Quedan $${surplus.toFixed(2)}`}
                        </div>
                      ) : limite.estado === "WARNING" ? (
                        <div className="text-right text-xs font-bold text-amber-600">
                          Quedan ${surplus.toFixed(2)}
                        </div>
                      ) : null}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => {
                            setLimiteEditando(limite);
                            setIsLimiteModalOpen(true);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar el límite de "${limite.categoriaNombre}"?`)) {
                              eliminarLimiteMutation.mutate(limite.id);
                            }
                          }}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AddMetaModal
        isOpen={isMetaModalOpen}
        onClose={closeMetaModal}
        onSubmit={handleSubmitMeta}
        isLoading={isSavingMeta}
        meta={metaEditando}
      />

      <AddLimiteModal
        isOpen={isLimiteModalOpen}
        onClose={closeLimiteModal}
        onSubmit={handleSubmitLimite}
        isLoading={isSavingLimite}
        limite={limiteEditando}
        defaultMonth={month}
        defaultYear={year}
      />
    </div>
  );
};
