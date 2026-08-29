import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerCuentasAhorro } from "../../services/bankingService";
import {
  type ActualizarMetaDTO,
  type CrearMetaDTO,
  type MetaAhorroDTO,
} from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearMetaDTO | ActualizarMetaDTO) => void;
  isLoading: boolean;
  meta?: MetaAhorroDTO | null;
}

const DEFAULT_FORM = {
  nombre: "",
  cuentaAhorroId: "" as number | "",
  montoObjetivoUsd: "",
  fechaLimite: "",
  activa: true,
};

export const AddMetaModal = ({ isOpen, onClose, onSubmit, isLoading, meta }: Props) => {
  const isEditMode = !!meta;

  const [nombre, setNombre] = useState(DEFAULT_FORM.nombre);
  const [cuentaAhorroId, setCuentaAhorroId] = useState<number | "">(DEFAULT_FORM.cuentaAhorroId);
  const [montoObjetivoUsd, setMontoObjetivoUsd] = useState(DEFAULT_FORM.montoObjetivoUsd);
  const [fechaLimite, setFechaLimite] = useState(DEFAULT_FORM.fechaLimite);
  const [activa, setActiva] = useState(DEFAULT_FORM.activa);

  const { data: cuentas = [] } = useQuery({
    queryKey: ["cuentas-ahorro"],
    queryFn: obtenerCuentasAhorro,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (meta) {
      setNombre(meta.nombre);
      setCuentaAhorroId(meta.cuentaAhorroId);
      setMontoObjetivoUsd(String(meta.montoObjetivoUsd));
      setFechaLimite(meta.fechaLimite ?? "");
      setActiva(meta.activa);
    } else {
      setNombre(DEFAULT_FORM.nombre);
      setCuentaAhorroId(cuentas[0]?.id ?? "");
      setMontoObjetivoUsd(DEFAULT_FORM.montoObjetivoUsd);
      setFechaLimite(DEFAULT_FORM.fechaLimite);
      setActiva(DEFAULT_FORM.activa);
    }
  }, [isOpen, meta, cuentas]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const base = {
      nombre,
      cuentaAhorroId: cuentaAhorroId as number,
      montoObjetivoUsd: Number(montoObjetivoUsd),
      fechaLimite: fechaLimite || null,
    };

    if (isEditMode) {
      onSubmit({ ...base, activa });
    } else {
      onSubmit(base);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditMode ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Ej. Fondo de emergencia, Viaje..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Cuenta vinculada</label>
            <select
              value={cuentaAhorroId}
              onChange={(e) => setCuentaAhorroId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg cursor-pointer"
              required
            >
              <option value="">Seleccionar cuenta...</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icono} {c.nombre} (${c.saldoEquivalenteUsd.toFixed(2)} USD)
                </option>
              ))}
            </select>
            {cuentas.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Crea una billetera primero en la sección Billeteras.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Monto objetivo (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montoObjetivoUsd}
              onChange={(e) => setMontoObjetivoUsd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Fecha límite (opcional)</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg cursor-pointer"
            />
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Estado</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiva(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                    activa ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-400"
                  }`}
                >
                  Activa
                </button>
                <button
                  type="button"
                  onClick={() => setActiva(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                    !activa ? "border-rose-500 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-400"
                  }`}
                >
                  Inactiva
                </button>
              </div>
            </div>
          )}

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
              disabled={isLoading || !nombre || cuentaAhorroId === "" || !montoObjetivoUsd}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Meta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
