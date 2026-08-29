import { useState, type FormEvent } from "react";
import { type CrearMovimientoAhorroDTO } from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearMovimientoAhorroDTO) => void;
  isLoading: boolean;
  cuentaAhorroId: number;
  cuentaNombre: string;
}

export const AddMovimientoAhorroModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  cuentaAhorroId,
  cuentaNombre,
}: Props) => {
  const [tipoOperacion, setTipoOperacion] = useState<"INGRESO" | "EGRESO">("INGRESO");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      cuentaAhorroId,
      tipoOperacion,
      monto: Number(monto),
      descripcion: descripcion || null,
      fecha,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Registrar Movimiento</h3>
            <p className="text-xs text-slate-500">{cuentaNombre}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoOperacion("INGRESO")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                  tipoOperacion === "INGRESO"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                ↓ Ingreso
              </button>
              <button
                type="button"
                onClick={() => setTipoOperacion("EGRESO")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                  tipoOperacion === "EGRESO"
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                ↑ Egreso
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Monto</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Ej. Depósito mensual, retiro..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={isLoading || !monto}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
