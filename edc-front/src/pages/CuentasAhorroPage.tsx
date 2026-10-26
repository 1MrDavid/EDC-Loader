import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  obtenerCuentasAhorro,
  obtenerMovimientosAhorro,
  crearCuentaAhorro,
  actualizarCuentaAhorro,
  eliminarCuentaAhorro,
  registrarMovimientoAhorro,
  actualizarMovimientoAhorro,
  eliminarMovimientoAhorro,
} from "../services/bankingService";
import {
  type ActualizarCuentaAhorroDTO,
  type CrearCuentaAhorroDTO,
  type CrearMovimientoAhorroDTO,
  type CuentaAhorroDTO,
  type MovimientoAhorroDTO,
} from "../types/finance";
import { AddCuentaAhorroModal } from "../components/modals/AddCuentaAhorroModal";
import { AddMovimientoAhorroModal } from "../components/modals/AddMovimientoAhorroModal";
import { CategoryBadge } from "../components/cards/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CuentasAhorroPage = () => {
  const queryClient = useQueryClient();
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null);
  const [isCuentaModalOpen, setIsCuentaModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<CuentaAhorroDTO | null>(null);
  const [movimientoEditando, setMovimientoEditando] = useState<MovimientoAhorroDTO | null>(null);

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

  const closeMovimientoModal = () => {
    setIsMovimientoModalOpen(false);
    setMovimientoEditando(null);
  };

  const openCreateMovimiento = () => {
    setMovimientoEditando(null);
    setIsMovimientoModalOpen(true);
  };

  const openEditMovimiento = (mov: MovimientoAhorroDTO) => {
    setMovimientoEditando(mov);
    setIsMovimientoModalOpen(true);
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

  const invalidarMovimientos = () => {
    queryClient.invalidateQueries({ queryKey: ["movimientos-ahorro"] });
    queryClient.invalidateQueries({ queryKey: ["cuentas-ahorro"] });
    queryClient.invalidateQueries({ queryKey: ["metas-ahorro"] });
    queryClient.invalidateQueries({ queryKey: ["deudas"] });
    queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });
  };

  const registrarMovimientoMutation = useMutation({
    mutationFn: registrarMovimientoAhorro,
    onSuccess: () => {
      invalidarMovimientos();
      closeMovimientoModal();
    },
    onError: (error: Error) => {
      alert(error.message || "Error al registrar el movimiento.");
    },
  });

  const actualizarMovimientoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CrearMovimientoAhorroDTO }) =>
      actualizarMovimientoAhorro(id, data),
    onSuccess: () => {
      invalidarMovimientos();
      closeMovimientoModal();
    },
    onError: (error: Error) => {
      alert(error.message || "Error al actualizar el movimiento.");
    },
  });

  const eliminarMovimientoMutation = useMutation({
    mutationFn: eliminarMovimientoAhorro,
    onSuccess: () => {
      invalidarMovimientos();
    },
    onError: () => alert("Error al eliminar el movimiento."),
  });

  const handleSubmitMovimiento = (data: CrearMovimientoAhorroDTO) => {
    if (movimientoEditando) {
      actualizarMovimientoMutation.mutate({ id: movimientoEditando.id, data });
    } else {
      registrarMovimientoMutation.mutate(data);
    }
  };

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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ahorros y Billeteras</h1>
          <p className="text-sm text-muted-foreground">Gestión de liquidez, divisas y cuentas de ahorro.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setCuentaEditando(null);
            setIsCuentaModalOpen(true);
          }}
        >
          + Nueva Billetera
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-8 p-6 md:flex-row md:items-center">
          <div className="w-full space-y-2 md:w-1/3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Patrimonio Líquido Total</h3>
            <p className="text-4xl font-bold text-foreground">
              ${capitalTotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <span>↑</span> Distribuido en {cuentas.length} cuentas
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 border-t border-border pt-6 md:w-2/3 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Distribución de Capital</h4>
            {cuentas.map((cuenta, index) => {
              const porcentaje = capitalTotalUsd > 0 ? (cuenta.saldoEquivalenteUsd / capitalTotalUsd) * 100 : 0;
              const fallbackBar = index % 2 === 0 ? "bg-emerald-500" : "bg-orange-500";
              return (
                <div key={`chart-${cuenta.id}`} className="flex items-center gap-3">
                  <span className="w-24 truncate text-xs font-semibold text-foreground">{cuenta.nombre}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${cuenta.color ? "" : fallbackBar}`}
                      style={{ width: `${porcentaje}%`, backgroundColor: cuenta.color || undefined }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-muted-foreground">{porcentaje.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-foreground">Tus Cuentas</h3>
          {cuentaActiva && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCuentaEditando(cuentaActiva);
                  setIsCuentaModalOpen(true);
                }}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-rose-600 dark:text-rose-400"
                onClick={() => {
                  if (confirm(`¿Eliminar la billetera "${cuentaActiva.nombre}"?`)) {
                    eliminarCuentaMutation.mutate(cuentaActiva.id);
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingCuentas ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
            ))
          ) : cuentas.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay billeteras registradas. Crea la primera.</div>
          ) : (
            cuentas.map((cuenta) => {
              const isSelected = cuentaSeleccionada === cuenta.id;
              return (
                <div
                  key={cuenta.id}
                  onClick={() => setCuentaSeleccionada(cuenta.id)}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all group
                    ${isSelected
                      ? "border-primary bg-card ring-1 ring-primary text-card-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                    }`}
                >
                  <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: cuenta.color }} />

                  <div className="mb-4 ml-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-muted p-1.5 text-xl">{cuenta.icono}</span>
                      <div>
                        <h4 className="text-sm leading-none font-bold">{cuenta.nombre}</h4>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Cuenta en {cuenta.tipoMoneda}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Activa</span>
                    )}
                  </div>

                  <div className="ml-2">
                    <p className="text-2xl font-bold text-foreground">
                      {cuenta.tipoMoneda === "Bs" ? "Bs. " : "$"}
                      {cuenta.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ≈ ${cuenta.saldoEquivalenteUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Mostrando actividad de:{" "}
              <span className="font-semibold text-foreground">{cuentaActiva?.nombre || "Seleccione una cuenta"}</span>
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateMovimiento}
            disabled={!cuentaSeleccionada}
          >
            + Registrar Movimiento
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loadingMovimientos && cuentaSeleccionada ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando movimientos...</div>
          ) : !cuentaSeleccionada ? (
            <div className="flex flex-col items-center p-12 text-center text-muted-foreground">
              <span className="mb-3 text-4xl">👆</span>
              Selecciona una tarjeta arriba para ver sus movimientos
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="px-6 text-xs uppercase">Fecha</TableHead>
                      <TableHead className="px-6 text-xs uppercase">Concepto / Descripción</TableHead>
                      <TableHead className="px-6 text-xs uppercase">Categoría</TableHead>
                      <TableHead className="px-6 text-xs uppercase">Operación</TableHead>
                      <TableHead className="px-6 text-right text-xs uppercase">Monto</TableHead>
                      <TableHead className="px-6 text-center text-xs uppercase">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          No hay movimientos registrados en esta cuenta.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimientos.map((mov) => {
                        const isIngreso = mov.tipoOperacion === "INGRESO";
                        return (
                          <TableRow key={mov.id}>
                            <TableCell className="px-6 whitespace-nowrap">
                              <span className="block text-sm font-semibold text-foreground">{mov.fecha}</span>
                              <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">ID: {mov.id}</span>
                            </TableCell>
                            <TableCell className="max-w-md px-6">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {mov.descripcion || "Sin descripción"}
                              </span>
                              {mov.registroBotId && (
                                <span className="mt-1 inline-block rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                                  Vinculado a Bot
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex flex-col items-start">
                                {mov.categoriaNombre ? (
                                  <CategoryBadge
                                    categoria={{
                                      nombre: mov.categoriaNombre,
                                      icono: mov.categoriaIcono || "🏷️",
                                      color: mov.categoriaColor || undefined,
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">Sin categoría</span>
                                )}
                                {mov.deudaNombre && (
                                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Pago: {mov.deudaNombre}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                                  isIngreso
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {isIngreso ? "↓ Ingreso" : "↑ Egreso"}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 text-right whitespace-nowrap">
                              <span className={`block text-sm font-bold ${isIngreso ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                                {isIngreso ? "+" : "-"}
                                {mov.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="text-primary"
                                  onClick={() => openEditMovimiento(mov)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="text-rose-600 dark:text-rose-400"
                                  onClick={() => {
                                    if (confirm("¿Eliminar este movimiento? Se revertirá el saldo.")) {
                                      eliminarMovimientoMutation.mutate(mov.id);
                                    }
                                  }}
                                >
                                  Quitar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="block divide-y divide-border md:hidden">
                {movimientos.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay movimientos registrados en esta cuenta.
                  </div>
                ) : (
                  movimientos.map((mov) => {
                    const isIngreso = mov.tipoOperacion === "INGRESO";
                    return (
                      <div key={mov.id} className="flex items-start gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {mov.descripcion || "Sin descripción"}
                          </span>
                          {mov.deudaNombre && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              Deuda: {mov.deudaNombre}
                            </span>
                          )}
                          <span className="mt-0.5 block text-xs text-muted-foreground">{mov.fecha}</span>
                          <div className="mt-1 flex flex-col items-start">
                            {mov.categoriaNombre ? (
                              <CategoryBadge
                                categoria={{
                                  nombre: mov.categoriaNombre,
                                  icono: mov.categoriaIcono || "🏷️",
                                  color: mov.categoriaColor || undefined,
                                }}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin categoría</span>
                            )}
                            {mov.deudaNombre && (
                              <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Pago: {mov.deudaNombre}
                              </span>
                            )}
                          </div>
                          <span
                            className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isIngreso
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isIngreso ? "↓ Ingreso" : "↑ Egreso"}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className={`text-sm font-bold ${isIngreso ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                            {isIngreso ? "+" : "-"}
                            {mov.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-primary"
                            onClick={() => openEditMovimiento(mov)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-rose-600 dark:text-rose-400"
                            onClick={() => {
                              if (confirm("¿Eliminar este movimiento? Se revertirá el saldo.")) {
                                eliminarMovimientoMutation.mutate(mov.id);
                              }
                            }}
                          >
                            Quitar
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
          onClose={closeMovimientoModal}
          onSubmit={handleSubmitMovimiento}
          isLoading={registrarMovimientoMutation.isPending || actualizarMovimientoMutation.isPending}
          cuentaAhorroId={cuentaActiva.id}
          cuentaNombre={cuentaActiva.nombre}
          movimientoEditando={movimientoEditando}
        />
      )}
    </div>
  );
};
