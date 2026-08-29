import { useEffect, useState, type FormEvent } from "react";
import { obtenerTodasCategorias } from "../../services/bankingService";
import {
  type ActualizarLimiteDTO,
  type CategoriaDTO,
  type CrearLimiteDTO,
  type LimiteCategoriaDTO,
} from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearLimiteDTO | ActualizarLimiteDTO) => void;
  isLoading: boolean;
  limite?: LimiteCategoriaDTO | null;
  defaultMonth: number;
  defaultYear: number;
}

export const AddLimiteModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  limite,
  defaultMonth,
  defaultYear,
}: Props) => {
  const isEditMode = !!limite;

  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [montoUsd, setMontoUsd] = useState("");
  const [esGlobal, setEsGlobal] = useState(true);
  const [mes, setMes] = useState(defaultMonth);
  const [ano, setAno] = useState(defaultYear);
  const [activa, setActiva] = useState(true);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    obtenerTodasCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));

    if (limite) {
      setCategoriaId(limite.categoriaId);
      setMontoUsd(String(limite.limiteUsd));
      setEsGlobal(limite.global);
      setMes(limite.mes ?? defaultMonth);
      setAno(limite.ano ?? defaultYear);
      setActiva(true);
    } else {
      setCategoriaId("");
      setMontoUsd("");
      setEsGlobal(false);
      setMes(defaultMonth);
      setAno(defaultYear);
      setActiva(true);
    }
  }, [isOpen, limite, defaultMonth, defaultYear]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const base = {
      categoriaId: categoriaId as number,
      montoUsd: Number(montoUsd),
      mes: esGlobal ? null : mes,
      ano: esGlobal ? null : ano,
    };

    if (isEditMode) {
      onSubmit({ ...base, activa });
    } else {
      onSubmit(base);
    }
  };

  const categoriasEgreso = categorias.filter((c) => c.tipo === "EGRESO");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditMode ? "Editar Límite" : "Nuevo Límite de Presupuesto"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg cursor-pointer"
              required
            >
              <option value="">Seleccionar categoría...</option>
              {categoriasEgreso.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Límite mensual (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montoUsd}
              onChange={(e) => setMontoUsd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <label className="block text-sm font-bold text-slate-600">Alcance del límite</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={esGlobal}
                onChange={() => setEsGlobal(true)}
                className="cursor-pointer"
              />
              <span className="text-sm text-slate-700">Global (todos los meses)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!esGlobal}
                onChange={() => setEsGlobal(false)}
                className="cursor-pointer"
              />
              <span className="text-sm text-slate-700">Solo un mes específico</span>
            </label>

            {!esGlobal && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mes</label>
                  <select
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("es", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Año</label>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
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
                  Activo
                </button>
                <button
                  type="button"
                  onClick={() => setActiva(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                    !activa ? "border-rose-500 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-400"
                  }`}
                >
                  Inactivo
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
              disabled={isLoading || categoriaId === "" || !montoUsd}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Límite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
