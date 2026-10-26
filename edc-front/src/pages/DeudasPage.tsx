import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerDeudasActivas, obtenerPagosDeuda, crearDeuda, actualizarDeuda, eliminarPagoDeuda, registrarPagoDeuda } from "../services/bankingService";
import { type ActualizarDeudaDTO, type CrearDeudaDTO, type DeudaDTO, type RegistrarPagoDeudaDTO } from "../types/finance";
import { AddDeudaModal } from "../components/modals/AddDeudaModal";
import { AddPagoDeudaModal } from "../components/modals/AddPagoDeudaModal";
import { CategoryBadge } from "../components/cards/CategoryBadge";
import { Button } from "@/components/ui/button";

const SELECT_CLASS =
  "flex h-10 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export const DeudasPage = () => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deudaEditando, setDeudaEditando] = useState<DeudaDTO | null>(null);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [deudaAPagar, setDeudaAPagar] = useState<DeudaDTO | null>(null);
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

  const openPagoModal = (deuda: DeudaDTO) => {
    setDeudaAPagar(deuda);
    setIsPagoModalOpen(true);
  };

  const closePagoModal = () => {
    setIsPagoModalOpen(false);
    setDeudaAPagar(null);
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
      queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
    },
  });

  const registrarPagoMutation = useMutation({
    mutationFn: registrarPagoDeuda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
      queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
      closePagoModal();
    },
    onError: (error: Error) => {
      alert(error.message || "Hubo un error al registrar el pago.");
    },
  });

  const handleSubmitPago = (data: RegistrarPagoDeudaDTO) => {
    registrarPagoMutation.mutate(data);
  };

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
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-muted/30 p-6 lg:w-1/3 lg:border-r lg:border-b-0 xl:w-1/4">
        <div className="mb-6 flex shrink-0 items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deudas y Suscripciones</h1>
            <p className="text-sm text-muted-foreground">Control de pagos recurrentes y cuotas.</p>
          </div>
          <Button type="button" size="sm" onClick={openCreateModal} className="shrink-0">
            + Nueva
          </Button>
        </div>

        <div className="custom-scrollbar flex flex-1 flex-row gap-4 overflow-x-auto pb-4 pr-2 lg:flex-col lg:overflow-y-auto lg:pb-10">
          {loadingDeudas ? (
            <div className="py-10 text-center text-muted-foreground animate-pulse">Cargando deudas...</div>
          ) : deudas.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No hay deudas activas.</div>
          ) : (
            deudas.map((deuda) => (
              <div
                key={deuda.id}
                className={`relative w-72 shrink-0 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all lg:w-full ${
                  deuda.pagadoEstePeriodo ? "border-emerald-500/30" : "border-border"
                }`}
              >
                <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: deuda.color }}></div>

                <div className="mt-1 mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{deuda.icono}</span>
                    <h3
                      onClick={() => openEditModal(deuda)}
                      className="cursor-pointer leading-tight font-bold text-foreground transition-colors hover:text-primary hover:underline"
                      title="Click para editar"
                    >
                      {deuda.nombre}
                    </h3>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${
                      deuda.pagadoEstePeriodo
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {deuda.pagadoEstePeriodo ? "Pagado" : "Pendiente"}
                  </span>
                </div>

                <div className="mb-4 inline-block rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  Tipo: {deuda.tipoDeuda === "CICLICA" ? "Cíclico" : "Definido"}{" "}
                  {deuda.frecuencia !== "UNA_VEZ" && `(${deuda.frecuencia.toLowerCase()})`}
                </div>

                {deuda.tipoDeuda === "CICLICA" ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monto USD:</span>
                      <span className="font-bold text-foreground">${deuda.montoEquivalenteUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monto Bs:</span>
                      <span className="font-bold text-foreground">
                        Bs. {deuda.montoEquivalenteBs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 space-y-2 border-t border-dashed border-border pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total USD:</span>
                      <span className="font-bold text-foreground">${deuda.montoEquivalenteUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Abonado USD:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${deuda.montoAbonadoUsd?.toFixed(2) || "0.00"}</span>
                    </div>
                    {deuda.cuotasTotales && (
                      <div className="pt-2">
                        <div className="mb-1 flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Cuotas Pagadas: {deuda.cuotasPagadas}</span>
                          <span>De: {deuda.cuotasTotales}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
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

                {(!deuda.pagadoEstePeriodo || deuda.tipoDeuda === "DEFINIDA") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => openPagoModal(deuda)}
                  >
                    Registrar pago
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6 lg:p-8">
        <div className="flex shrink-0 flex-col items-start justify-between gap-6 xl:flex-row xl:items-center">
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
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-[120px] flex-col items-center rounded-xl border border-border bg-card px-5 py-3">
              <span className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Monto Pagado</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${montoPagadoUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex min-w-[120px] flex-col items-center rounded-xl border border-border bg-card px-5 py-3">
              <span className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Monto Pendiente</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                ${montoPendienteUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex min-w-[120px] flex-col items-center rounded-xl border border-border bg-card px-5 py-3">
              <span className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Deudas Pagadas</span>
              <span className="text-lg font-bold text-foreground">{deudasPagadas}</span>
            </div>
            <div className="flex min-w-[120px] flex-col items-center rounded-xl border border-border bg-card px-5 py-3">
              <span className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Deudas Pendientes</span>
              <span className="text-lg font-bold text-foreground">{deudasPendientes}</span>
            </div>
          </div>
        </div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-bold text-foreground">Historial de Pagos de Deudas</h2>
            <p className="text-xs text-muted-foreground">Registros abonados en el período seleccionado.</p>
          </div>

          {loadingPagos ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando pagos...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="hidden w-full border-collapse text-left md:table">
                  <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-4">Deuda & Fecha</th>
                      <th className="px-6 py-4">Detalle</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4 text-right">Monto (Bs / $)</th>
                      <th className="px-6 py-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No hay pagos registrados en este período.
                        </td>
                      </tr>
                    ) : (
                      pagos.map((pago) => (
                        <tr key={pago.id} className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <span className="flex items-center gap-2 font-semibold text-foreground">
                              <span>{pago.deudaIcono || "💳"}</span>
                              {pago.deudaNombre || "Deuda desconocida"}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{pago.fechaPago}</span>
                            <span className="mt-0.5 block font-mono text-xs text-muted-foreground">ID: {pago.id}</span>
                          </td>
                          <td className="max-w-xs px-6 py-4 text-sm">
                            <span
                              className="mr-2 inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: pago.deudaColor || "#64748b" }}
                            ></span>
                            <span className="text-muted-foreground">
                              Pago {pago.origen === "AUTO" ? "automático" : pago.origen === "BILLETERA" ? "desde billetera" : "manual"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {pago.categoria ? (
                              <CategoryBadge categoria={pago.categoria} />
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin categoría</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className="block text-sm font-bold text-rose-600 dark:text-rose-400">
                              -{(pago.montoPagadoBs ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                            </span>
                            <span className="mt-0.5 block text-xs font-medium text-rose-500/80 dark:text-rose-300">
                              -${(pago.montoPagadoUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              className="text-rose-600 dark:text-rose-400"
                              onClick={() => {
                                if (confirm(`¿Eliminar pago de ${pago.deudaNombre}?`)) {
                                  eliminarPagoMutation.mutate(pago.id);
                                }
                              }}
                            >
                              Quitar
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="block divide-y divide-border md:hidden">
                {pagos.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay pagos registrados en este período.
                  </div>
                ) : (
                  pagos.map((pago) => (
                    <div key={pago.id} className="flex flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {pago.deudaIcono || "💳"} {pago.deudaNombre || "Deuda desconocida"}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{pago.fechaPago}</span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block text-sm font-bold text-rose-600 dark:text-rose-400">
                            -{(pago.montoPagadoBs ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                          </span>
                          <span className="block text-xs font-medium text-rose-500/80 dark:text-rose-300">
                            -${(pago.montoPagadoUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {pago.categoria ? (
                          <CategoryBadge categoria={pago.categoria} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin categoría</span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-rose-600 dark:text-rose-400"
                          onClick={() => {
                            if (confirm(`¿Eliminar pago de ${pago.deudaNombre}?`)) {
                              eliminarPagoMutation.mutate(pago.id);
                            }
                          }}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
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

      <AddPagoDeudaModal
        isOpen={isPagoModalOpen}
        onClose={closePagoModal}
        onSubmit={handleSubmitPago}
        isLoading={registrarPagoMutation.isPending}
        deuda={deudaAPagar}
      />
    </div>
  );
};
