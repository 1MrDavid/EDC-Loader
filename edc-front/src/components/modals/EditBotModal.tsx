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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroBotDTO | null;
}

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

  if (!isOpen || !registro) return null;

  const patronPreview =
    tipoPatron === "CONCEPTO"
      ? formData.concepto
      : tipoPatron === "BENEFICIARIO"
        ? formData.beneficiario
        : formData.referencia;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Editar Registro en Vivo</h2>
        
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Monto</label>
              <input 
                type="number" 
                value={formData.monto || 0} 
                onChange={e => setFormData({...formData, monto: Number(e.target.value)})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 cursor-text"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Naturaleza</label>
              <select 
                value={formData.esIngreso ? "true" : "false"}
                onChange={e => setFormData({...formData, esIngreso: e.target.value === "true"})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white cursor-pointer"
              >
                <option value="false">Egreso (Resta)</option>
                <option value="true">Ingreso (Suma)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Fecha</label>
              <input 
                type="date" 
                value={formData.fecha || ''} 
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Banco Origen</label>
              <input 
                type="text" 
                value={formData.bancoOrigen || ''} 
                onChange={e => setFormData({...formData, bancoOrigen: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm cursor-text"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Banco Destino</label>
              <input 
                type="text" 
                value={formData.bancoDestino || ''} 
                onChange={e => setFormData({...formData, bancoDestino: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm cursor-text"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Referencia</label>
              <input 
                type="text" 
                value={formData.referencia || ''} 
                onChange={e => setFormData({...formData, referencia: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm cursor-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Concepto / Detalle</label>
              <input 
                type="text" 
                value={formData.concepto || ''} 
                onChange={e => setFormData({...formData, concepto: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 cursor-text"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Beneficiario / Contraparte</label>
              <input 
                type="text" 
                value={formData.beneficiario || ''} 
                onChange={e => setFormData({...formData, beneficiario: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 cursor-text"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
            <label className="text-xs font-semibold text-slate-500 uppercase">Asignar Categoría</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white mb-4 cursor-pointer"
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
              {categorias?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icono} {cat.nombre}</option>
              ))}
            </select>

            {formData.categoria?.id && (
              <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crearRegla}
                    onChange={(e) => setCrearRegla(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">Crear regla automática para futuros movimientos</span>
                </label>
                
                {crearRegla && (
                  <div className="pl-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Basado en:</span>
                      <select 
                        value={tipoPatron}
                        onChange={(e) => setTipoPatron(e.target.value as "CONCEPTO" | "BENEFICIARIO" | "REFERENCIA")}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white cursor-pointer"
                      >
                        <option value="CONCEPTO">Concepto</option>
                        <option value="BENEFICIARIO">Beneficiario</option>
                        <option value="REFERENCIA">Referencia</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-400">
                      Patrón: <span className="font-mono text-slate-600">{patronPreview?.trim() || "(vacío — no se podrá crear la regla)"}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!formData.esIngreso && formData.categoria?.id && (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <label className="text-xs font-semibold text-emerald-700 uppercase">Pago de Deuda</label>
              {formData.pagoDeudaId ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">
                    ✓ Pagó: {formData.deudaNombre}
                  </span>
                  <button
                    type="button"
                    onClick={() => pagoMutation.mutate("delete")}
                    disabled={pagoMutation.isPending}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Quitar pago
                  </button>
                </div>
              ) : deudaAsociada ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Categoría vinculada a: <strong>{deudaAsociada.nombre}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => pagoMutation.mutate("register")}
                    disabled={pagoMutation.isPending}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    Marcar como pagado
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">Esta categoría no está vinculada a ninguna deuda activa.</p>
              )}
            </div>
          )}

          {feedback && (
            <div className={`p-3 rounded-lg text-sm ${feedback.includes("error") || feedback.includes("vacío") ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
              {feedback}
            </div>
          )}

        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer">Cancelar</button>
          <button 
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending || (crearRegla && !patronPreview?.trim())}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar y Aplicar'}
          </button>
        </div>
      </div>
    </div>
  );
};
