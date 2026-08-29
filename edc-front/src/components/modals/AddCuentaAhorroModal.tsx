import { useEffect, useState, type FormEvent } from "react";
import {
  type ActualizarCuentaAhorroDTO,
  type CrearCuentaAhorroDTO,
  type CuentaAhorroDTO,
} from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearCuentaAhorroDTO | ActualizarCuentaAhorroDTO) => void;
  isLoading: boolean;
  cuenta?: CuentaAhorroDTO | null;
}

const MONEDAS = ["USD", "USDT", "Bs", "EUR"];
const EMOJIS = ["💰", "🏦", "💵", "🪙", "📈", "🔒", "🎯", "💳"];

const DEFAULT_FORM = {
  nombre: "",
  tipoMoneda: "USD",
  saldoInicial: "",
  color: "#64748b",
  icono: "💰",
};

export const AddCuentaAhorroModal = ({ isOpen, onClose, onSubmit, isLoading, cuenta }: Props) => {
  const isEditMode = !!cuenta;

  const [nombre, setNombre] = useState(DEFAULT_FORM.nombre);
  const [tipoMoneda, setTipoMoneda] = useState(DEFAULT_FORM.tipoMoneda);
  const [saldoInicial, setSaldoInicial] = useState(DEFAULT_FORM.saldoInicial);
  const [color, setColor] = useState(DEFAULT_FORM.color);
  const [icono, setIcono] = useState(DEFAULT_FORM.icono);

  useEffect(() => {
    if (!isOpen) return;

    if (cuenta) {
      setNombre(cuenta.nombre);
      setTipoMoneda(cuenta.tipoMoneda);
      setSaldoInicial("");
      setColor(cuenta.color);
      setIcono(cuenta.icono);
    } else {
      setNombre(DEFAULT_FORM.nombre);
      setTipoMoneda(DEFAULT_FORM.tipoMoneda);
      setSaldoInicial(DEFAULT_FORM.saldoInicial);
      setColor(DEFAULT_FORM.color);
      setIcono(DEFAULT_FORM.icono);
    }
  }, [isOpen, cuenta]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      onSubmit({ nombre, tipoMoneda, color, icono });
    } else {
      onSubmit({
        nombre,
        tipoMoneda,
        saldoInicial: saldoInicial ? Number(saldoInicial) : 0,
        color,
        icono,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditMode ? "Editar Billetera" : "Nueva Billetera"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Ej. Binance, Efectivo USD, Ahorro..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Moneda</label>
            <select
              value={tipoMoneda}
              onChange={(e) => setTipoMoneda(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {MONEDAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Saldo inicial</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Ícono</label>
              <input
                type="text"
                maxLength={2}
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-xl"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emj) => (
              <button
                key={emj}
                type="button"
                onClick={() => setIcono(emj)}
                className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg cursor-pointer"
              >
                {emj}
              </button>
            ))}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !nombre || !icono}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Billetera"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
