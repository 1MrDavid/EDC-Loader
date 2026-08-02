import { useState, type FormEvent } from "react";
import { type CrearCategoriaDTO } from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearCategoriaDTO) => void;
  isLoading: boolean;
}

// Lista rápida de emojis sugeridos
const EMOJIS = ["🛒", "💡", "🍔", "🚗", "🏠", "💊", "🎉", "💰", "📱", "✈️"];

export const AddCategoriaModal = ({ isOpen, onClose, onSubmit, isLoading }: Props) => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<'INGRESO' | 'EGRESO'>('EGRESO');
  const [color, setColor] = useState("#64748b");
  const [icono, setIcono] = useState("🏷️");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, tipo, color, icono });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Nueva Categoría</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Nombre</label>
            <input 
              type="text" 
              placeholder="Ej. Restaurantes, Transporte..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Movimiento</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('EGRESO')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  tipo === 'EGRESO' 
                    ? 'border-rose-500 bg-rose-50 text-rose-600' 
                    : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                Egreso
              </button>
              <button
                type="button"
                onClick={() => setTipo('INGRESO')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  tipo === 'INGRESO' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                    : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Color e Icono */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Color Identificador</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-14 p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
                />
                <span className="text-xs font-mono text-slate-500 uppercase">{color}</span>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Ícono (Emoji)</label>
              <input 
                type="text" 
                maxLength={2}
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl"
                required
              />
            </div>
          </div>

          {/* Sugerencias de Iconos */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(emj => (
                <button
                  key={emj}
                  type="button"
                  onClick={() => setIcono(emj)}
                  className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg transition-colors"
                >
                  {emj}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !nombre || !icono}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};