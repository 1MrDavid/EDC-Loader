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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SELECT_CLASS =
  "flex h-10 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

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
        return { bg: "bg-destructive", text: "text-destructive font-bold", border: "border-destructive/30", lightBg: "bg-destructive/10" };
      case "WARNING":
        return { bg: "bg-amber-500", text: "text-amber-500 font-bold", border: "border-amber-500/30", lightBg: "bg-amber-500/10" };
      case "SAFE":
      default:
        return { bg: "bg-primary", text: "text-primary", border: "border-border", lightBg: "bg-card" };
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ahorros y Límites</h1>
          <p className="text-muted-foreground text-sm">Control de presupuestos mensuales y metas a largo plazo.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={SELECT_CLASS}
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
            className={SELECT_CLASS}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-foreground">Metas de Ahorro</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setMetaEditando(null);
              setIsMetaModalOpen(true);
            }}
          >
            + Nueva Meta
          </Button>
        </div>

        {loadingMetas ? (
          <Card className="animate-pulse">
            <CardContent className="flex flex-col gap-4 p-8">
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ) : metas.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sin metas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center text-muted-foreground">
              No hay metas de ahorro activas. Crea una para empezar a medir tu progreso.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {metas.map((meta) => (
              <Card key={meta.id} className="relative overflow-hidden bg-card border-border text-card-foreground shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 ml-2 gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-card-foreground">{meta.nombre}</h2>
                      {meta.cuentaAhorroNombre && (
                        <p className="text-xs text-muted-foreground mt-1">Vinculada a: {meta.cuentaAhorroNombre}</p>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Monto Actual vs. Meta</span>
                        <p className="text-lg font-bold text-card-foreground">
                          ${meta.saldoActualUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                          <span className="text-muted-foreground font-normal">
                            / ${meta.montoObjetivoUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setMetaEditando(meta);
                            setIsMetaModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`¿Eliminar la meta "${meta.nombre}"?`)) {
                              eliminarMetaMutation.mutate(meta.id);
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="ml-2 mb-3">
                    <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${Math.min(meta.porcentajeAvance, 100)}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-background/20" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                      <span className="font-bold text-primary">
                        Porcentaje completado: {meta.porcentajeAvance.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground italic">
                        {meta.mesesEstimadosRestantes > 0
                          ? `Al ritmo actual, alcanzarás la meta en aprox. ${meta.mesesEstimadosRestantes} meses`
                          : meta.fechaLimite
                            ? "Meta con fecha límite definida"
                            : "¡Sigue ahorrando para calcular un estimado!"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-foreground">Presupuestos por Categoría</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setLimiteEditando(null);
              setIsLimiteModalOpen(true);
            }}
          >
            + Nuevo Límite
          </Button>
        </div>

        {loadingLimites ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : limites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No tienes límites presupuestarios configurados para este mes.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {limites.map((limite) => {
              const colors = getStatusColors(limite.estado);
              const isOverLimit = limite.gastadoUsd > limite.limiteUsd;
              const surplus = Math.abs(limite.limiteUsd - limite.gastadoUsd);

              return (
                <div key={limite.id} className={`${colors.lightBg} ${colors.border} rounded-2xl border p-5 shadow-sm transition-all`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{limite.categoriaIcono}</span>
                      <div>
                        <h4 className="font-bold text-card-foreground">{limite.categoriaNombre}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {limite.global ? "Límite global" : `Mes ${limite.mes}/${limite.ano}`}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${colors.text} bg-background/60`}>
                      {limite.porcentajeConsumo.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2 mb-1 overflow-hidden">
                      <div
                        className={`${colors.bg} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(limite.porcentajeConsumo, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-end text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        Límite: <span className="font-semibold text-card-foreground">${limite.limiteUsd.toFixed(2)}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Gastado: <span className="font-semibold text-card-foreground">${limite.gastadoUsd.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {limite.estado === "DANGER" ? (
                        <div className="text-right text-xs font-bold text-destructive flex items-center gap-1">
                          <span>⚠️</span>
                          {isOverLimit ? `Excedido por $${surplus.toFixed(2)}` : `Quedan $${surplus.toFixed(2)}`}
                        </div>
                      ) : limite.estado === "WARNING" ? (
                        <div className="text-right text-xs font-bold text-amber-500">
                          Quedan ${surplus.toFixed(2)}
                        </div>
                      ) : null}
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setLimiteEditando(limite);
                            setIsLimiteModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`¿Eliminar el límite de "${limite.categoriaNombre}"?`)) {
                              eliminarLimiteMutation.mutate(limite.id);
                            }
                          }}
                        >
                          Eliminar
                        </Button>
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
