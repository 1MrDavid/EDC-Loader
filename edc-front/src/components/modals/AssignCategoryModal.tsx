import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type MovimientoDTO, type CrearReglaDTO } from "../../types/finance";
import { obtenerTodasCategorias, crearReglaCategorizacion, asignarCategoriaMovimiento } from "../../services/bankingService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  movimiento: MovimientoDTO | null;
}

export const AssignCategoryModal = ({ isOpen, onClose, movimiento }: Props) => {
  const queryClient = useQueryClient();
  
  // Estados del modal
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [createRule, setCreateRule] = useState(false);
  
  // Estados para la regla
  const [ruleType, setRuleType] = useState<"DESCRIPCION" | "REFERENCIA">("DESCRIPCION");
  const [rulePattern, setRulePattern] = useState("");

  // Cargar las categorías (solo si el modal está abierto)
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: obtenerTodasCategorias,
    enabled: isOpen,
  });

  // Pre-llenar el patrón cuando se abre el modal y se marca la regla
  useEffect(() => {
    if (movimiento) {
      setRulePattern(ruleType === "DESCRIPCION" ? movimiento.descripcion : (movimiento.referencia || ""));
    }
  }, [movimiento, ruleType]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedCategoryId(null);
      setCreateRule(false);
    }
  }, [isOpen]);

  // Filtrar categorías por el buscador
  const filteredCategories = useMemo(() => {
    return categorias.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categorias, searchTerm]);

  // Mutación centralizada
  const mutation = useMutation({
    mutationFn: async () => {
      if (!movimiento || !selectedCategoryId) return;

      if (createRule) {
        const dto: CrearReglaDTO = {
          patron: rulePattern,
          tipoPatron: ruleType,
          categoriaId: selectedCategoryId,
        };
        await crearReglaCategorizacion(dto);
      } else {
        await asignarCategoriaMovimiento(movimiento.id, selectedCategoryId);
      }
    },
    onSuccess: () => {
      // Refrescar los movimientos para que se vea el cambio en la tabla
      queryClient.invalidateQueries({ queryKey: ["movimientos"] }); 
      onClose();
    }
  });

  if (!isOpen || !movimiento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Asignar Categoría</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* INFO DEL MOVIMIENTO */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1">Movimiento Seleccionado</p>
            <p className="font-medium text-slate-800">{movimiento.descripcion}</p>
            <p className="text-sm font-mono text-slate-500">Monto: {movimiento.ingreso ? `+${movimiento.ingreso}` : `-${movimiento.egreso}`}</p>
          </div>

          {/* BUSCADOR */}
          <div>
            <input 
              type="text" 
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* LISTA DE CATEGORÍAS (SCROLL) */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Selecciona una:</p>
            {isLoading ? (
              <div className="text-center text-slate-400 text-sm py-4">Cargando...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      selectedCategoryId === cat.id 
                        ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      {cat.icono}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">{cat.nombre}</p>
                      <p className="text-[10px] font-bold text-slate-400">{cat.tipo}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* REGLA AUTOMÁTICA */}
          <div className="space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={createRule}
                onChange={(e) => setCreateRule(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="block text-sm font-bold text-slate-700">Crear regla automática</span>
                <span className="block text-xs text-slate-500">Los movimientos futuros que coincidan se categorizarán solos.</span>
              </div>
            </label>

            {createRule && (
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Buscar coincidencia en:</label>
                  <select 
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as any)}
                    className="w-full text-sm border-slate-300 rounded-md p-2 bg-white"
                  >
                    <option value="DESCRIPCION">Descripción</option>
                    <option value="REFERENCIA">Referencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">El texto debe contener:</label>
                  <input 
                    type="text" 
                    value={rulePattern}
                    onChange={(e) => setRulePattern(e.target.value)}
                    className="w-full text-sm border-slate-300 rounded-md p-2 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Puedes borrar partes del texto para hacer la regla más general.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER BOTONES */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-white transition-colors">
            Cancelar
          </button>
          <button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !selectedCategoryId || (createRule && !rulePattern.trim())}
            className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Guardando...' : 'Aplicar Categoría'}
          </button>
        </div>

      </div>
    </div>
  );
};