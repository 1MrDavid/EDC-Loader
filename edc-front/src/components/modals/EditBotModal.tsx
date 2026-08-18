import { useState, useEffect } from "react";
import { type RegistroBotDTO } from "../../types/finance";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  actualizarRegistroBot, 
  obtenerTodasCategorias, 
  crearReglaCategorizacion 
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
  const [tipoPatron, setTipoPatron] = useState<"CONCEPTO" | "BENEFICIARIO">("CONCEPTO");
  
  const { data: categorias } = useQuery({ queryKey: ["categorias"], queryFn: obtenerTodasCategorias });

  useEffect(() => {
    if (registro) {
      setFormData(registro);
      setCrearRegla(false);
    }
  }, [registro]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<RegistroBotDTO>) => {
      await actualizarRegistroBot(registro!.id, data);
      
      if (crearRegla && data.categoria?.id) {
        // CORRECCIÓN: Leemos directamente de formData en lugar del payload 'data' 
        // para asegurar que toma el texto escrito por el usuario.
        const patronTexto = tipoPatron === "CONCEPTO" ? formData.concepto : formData.beneficiario;
        if (patronTexto && patronTexto.trim() !== "") {
          await crearReglaCategorizacion({
            patron: patronTexto,
            tipoPatron: tipoPatron,
            categoriaId: data.categoria.id
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
      queryClient.invalidateQueries({ queryKey: ["categorias-resumen"] });
      onClose();
    }
  });

  if (!isOpen || !registro) return null;

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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Naturaleza</label>
              <select 
                value={formData.esIngreso ? "true" : "false"}
                onChange={e => setFormData({...formData, esIngreso: e.target.value === "true"})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white"
              >
                <option value="false">Egreso (Resta)</option>
                <option value="true">Ingreso (Suma)</option>
              </select>
            </div>
            {/* NUEVO INPUT: FECHA */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Fecha</label>
              <input 
                type="date" 
                value={formData.fecha || ''} 
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Banco Destino</label>
              <input 
                type="text" 
                value={formData.bancoDestino || ''} 
                onChange={e => setFormData({...formData, bancoDestino: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Referencia</label>
              <input 
                type="text" 
                value={formData.referencia || ''} 
                onChange={e => setFormData({...formData, referencia: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 font-mono text-sm"
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Beneficiario / Contraparte</label>
              <input 
                type="text" 
                value={formData.beneficiario || ''} 
                onChange={e => setFormData({...formData, beneficiario: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
            <label className="text-xs font-semibold text-slate-500 uppercase">Asignar Categoría</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white mb-4"
              value={formData.categoria?.id || ""}
              onChange={e => setFormData({
                ...formData, 
                categoria: categorias?.find(c => c.id === Number(e.target.value)) as any
              })}
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
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Crear regla automática para futuros movimientos</span>
                </label>
                
                {crearRegla && (
                  <div className="pl-6 flex items-center gap-3">
                    <span className="text-sm text-slate-500">Basado en:</span>
                    <select 
                      value={tipoPatron}
                      onChange={(e) => setTipoPatron(e.target.value as "CONCEPTO" | "BENEFICIARIO")}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white"
                    >
                      <option value="CONCEPTO">Concepto ({formData.concepto || 'Vacio'})</option>
                      <option value="BENEFICIARIO">Beneficiario ({formData.beneficiario || 'Vacio'})</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancelar</button>
          <button 
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar y Aplicar'}
          </button>
        </div>
      </div>
    </div>
  );
};