import { useState, useEffect } from "react";
import { type RegistroBotDTO } from "../../types/finance";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  actualizarRegistroBot, 
  obtenerTodasCategorias, 
  crearReglaCategorizacion,
  obtenerDeudasActivas,
  registrarPagoDeuda,
  eliminarPagoDeuda
} from "../../services/bankingService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroBotDTO | null;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const EditBotModal = ({ isOpen, onClose, registro }: Props) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<RegistroBotDTO>>({});
  
  const [crearRegla, setCrearRegla] = useState(false);
  const [tipoPatron, setTipoPatron] = useState<"CONCEPTO" | "BENEFICIARIO" | "REFERENCIA">("CONCEPTO");
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const { data: categorias } = useQuery({ queryKey: ["categorias"], queryFn: obtenerTodasCategorias });
  const { data: deudas = [] } = useQuery({ queryKey: ["deudas"], queryFn: () => obtenerDeudasActivas() });

  const deudaAsociada = deudas.find(d => d.categoria?.id === formData.categoria?.id);

  useEffect(() => {
    if (registro) {
      setFormData(registro);
      setCrearRegla(false);
      setFeedback(null);
    }
  }, [registro]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<RegistroBotDTO>) => {
      const updated = await actualizarRegistroBot(registro!.id, data);

      if (crearRegla && data.categoria?.id) {
        const patronTexto =
          tipoPatron === "CONCEPTO"
            ? formData.concepto
            : tipoPatron === "BENEFICIARIO"
              ? formData.beneficiario
              : formData.referencia;

        if (!patronTexto || patronTexto.trim() === "") {
          throw new Error(`El campo seleccionado (${tipoPatron.toLowerCase()}) está vacío. No se puede crear la regla.`);
        }

        const reglaResult = await crearReglaCategorizacion({
          patron: patronTexto.trim(),
          tipoPatron,
          categoriaId: data.categoria.id,
        });
        return { updated, reglaResult };
      }

      return { updated, reglaResult: null };
    },
    onSuccess: ({ updated, reglaResult }) => {
      if (updated) {
        setFormData(updated);
      }
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-resumen"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });

      if (updated?.pagoDeudaId && updated.deudaNombre) {
        setFeedback(`Pago de deuda detectado: ${updated.deudaNombre}`);
        setTimeout(onClose, 1500);
        return;
      }

      if (reglaResult) {
        const total = reglaResult.movimientosActualizados + reglaResult.registrosBotActualizados;
        if (total === 0) {
          setFeedback(
            `Regla creada, pero no coincidió con otros registros pendientes. Se aplicará a futuros movimientos que contengan "${reglaResult.patron}".`
          );
          return;
        }
        setFeedback(
          `Regla creada. Se categorizaron ${reglaResult.registrosBotActualizados} registro(s) en vivo y ${reglaResult.movimientosActualizados} movimiento(s) histórico(s).`
        );
        setTimeout(onClose, 2000);
        return;
      }

      onClose();
    },
    onError: (error: Error) => {
      setFeedback(error.message || "Hubo un error al guardar.");
    },
  });

  const pagoMutation = useMutation({
    mutationFn: async (action: "register" | "delete") => {
      if (action === "delete" && formData.pagoDeudaId) {
        await eliminarPagoDeuda(formData.pagoDeudaId);
        return null;
      }
      if (action === "register" && deudaAsociada && registro) {
        return registrarPagoDeuda({
          deudaId: deudaAsociada.id,
          registroBotId: registro.id,
          fechaPago: formData.fecha || registro.fecha,
          montoPagadoBs: formData.monto ?? registro.monto,
          montoPagadoUsd: formData.montoDolar ?? registro.montoDolar,
          origen: "MANUAL",
        });
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });
      onClose();
    },
    onError: (error: Error) => {
      setFeedback(error.message || "Error al gestionar el pago de deuda.");
    },
  });

  const patronPreview =
    tipoPatron === "CONCEPTO"
      ? formData.concepto
      : tipoPatron === "BENEFICIARIO"
        ? formData.beneficiario
        : formData.referencia;

  const categoriasFiltradas = categorias?.filter(cat =>
    cat.tipo === (formData.esIngreso ? 'INGRESO' : 'EGRESO')
  ) || [];

  return (
    <Dialog open={isOpen && !!registro} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro en Vivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bot-monto" className="text-xs uppercase text-muted-foreground">Monto</Label>
              <Input
                id="bot-monto"
                type="number"
                value={formData.monto || 0}
                onChange={e => setFormData({...formData, monto: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-naturaleza" className="text-xs uppercase text-muted-foreground">Naturaleza</Label>
              <select
                id="bot-naturaleza"
                value={formData.esIngreso ? "true" : "false"}
                onChange={e => setFormData({
                  ...formData,
                  esIngreso: e.target.value === "true",
                  categoria: null,
                })}
                className={SELECT_CLASS}
              >
                <option value="false">Egreso (Resta)</option>
                <option value="true">Ingreso (Suma)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-fecha" className="text-xs uppercase text-muted-foreground">Fecha</Label>
              <Input
                id="bot-fecha"
                type="date"
                value={formData.fecha || ''}
                onChange={e => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bot-origen" className="text-xs uppercase text-muted-foreground">Banco Origen</Label>
              <Input
                id="bot-origen"
                type="text"
                value={formData.bancoOrigen || ''}
                onChange={e => setFormData({...formData, bancoOrigen: e.target.value})}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-destino" className="text-xs uppercase text-muted-foreground">Banco Destino</Label>
              <Input
                id="bot-destino"
                type="text"
                value={formData.bancoDestino || ''}
                onChange={e => setFormData({...formData, bancoDestino: e.target.value})}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-ref" className="text-xs uppercase text-muted-foreground">Referencia</Label>
              <Input
                id="bot-ref"
                type="text"
                value={formData.referencia || ''}
                onChange={e => setFormData({...formData, referencia: e.target.value})}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bot-concepto" className="text-xs uppercase text-muted-foreground">Concepto / Detalle</Label>
              <Input
                id="bot-concepto"
                type="text"
                value={formData.concepto || ''}
                onChange={e => setFormData({...formData, concepto: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-beneficiario" className="text-xs uppercase text-muted-foreground">Beneficiario / Contraparte</Label>
              <Input
                id="bot-beneficiario"
                type="text"
                value={formData.beneficiario || ''}
                onChange={e => setFormData({...formData, beneficiario: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-2 space-y-3 rounded-xl border border-border bg-muted p-4">
            <Label htmlFor="bot-categoria" className="text-xs uppercase text-muted-foreground">Asignar Categoría</Label>
            <select
              id="bot-categoria"
              className={SELECT_CLASS}
              value={formData.categoria?.id || ""}
              onChange={e => {
                const cat = categorias?.find(c => c.id === Number(e.target.value));
                setFormData({
                  ...formData, 
                  categoria: cat ? { id: cat.id, nombre: cat.nombre, color: cat.color, icono: cat.icono } : null
                });
              }}
            >
              <option value="">-- Seleccionar Categoría --</option>
              {categoriasFiltradas.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icono} {cat.nombre}</option>
              ))}
            </select>

            {formData.categoria?.id && (
              <div className="flex flex-col gap-3 border-t border-border pt-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={crearRegla}
                    onChange={(e) => setCrearRegla(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">Crear regla automática para futuros movimientos</span>
                </label>

                {crearRegla && (
                  <div className="flex flex-col gap-2 pl-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Basado en:</span>
                      <select
                        value={tipoPatron}
                        onChange={(e) => setTipoPatron(e.target.value as "CONCEPTO" | "BENEFICIARIO" | "REFERENCIA")}
                        className={SELECT_CLASS}
                      >
                        <option value="CONCEPTO">Concepto</option>
                        <option value="BENEFICIARIO">Beneficiario</option>
                        <option value="REFERENCIA">Referencia</option>
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Patrón: <span className="font-mono text-foreground">{patronPreview?.trim() || "(vacío — no se podrá crear la regla)"}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!formData.esIngreso && formData.categoria?.id && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <Label className="text-xs uppercase text-emerald-700 dark:text-emerald-400">Pago de Deuda</Label>
              {formData.pagoDeudaId ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    ✓ Pagó: {formData.deudaNombre}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => pagoMutation.mutate("delete")}
                    disabled={pagoMutation.isPending}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    Quitar pago
                  </Button>
                </div>
              ) : deudaAsociada ? (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">
                    Categoría vinculada a: <strong className="text-foreground">{deudaAsociada.nombre}</strong>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => pagoMutation.mutate("register")}
                    disabled={pagoMutation.isPending}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Marcar como pagado
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Esta categoría no está vinculada a ninguna deuda activa.</p>
              )}
            </div>
          )}

          {feedback && (
            <div className={`rounded-lg p-3 text-sm ${feedback.includes("error") || feedback.includes("vacío") ? "border border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-400" : "border border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"}`}>
              {feedback}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending || (crearRegla && !patronPreview?.trim())}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar y Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
