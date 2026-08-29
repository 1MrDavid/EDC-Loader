import { useEffect, useState, type FormEvent } from "react";
import { obtenerTodasCategorias } from "../../services/bankingService";
import { type ActualizarDeudaDTO, type CategoriaDTO, type CrearDeudaDTO, type DeudaDTO } from "../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearDeudaDTO | ActualizarDeudaDTO) => void;
  isLoading: boolean;
  deuda?: DeudaDTO | null;
}

const EMOJIS = ["💳", "🏠", "📱", "🚗", "💡", "🎬", "🏋️", "📺", "🛡️", "💰"];

const DEFAULT_FORM = {
  nombre: "",
  tipoDeuda: "CICLICA" as const,
  frecuencia: "MENSUAL",
  montoUsd: "",
  montoBs: "",
  montoEur: "",
  categoriaId: "" as number | "",
  fechaInicio: new Date().toISOString().split("T")[0],
  fechaFin: "",
  color: "#64748b",
  icono: "💳",
  cuotasTotales: "",
  activa: true,
};

export const AddDeudaModal = ({ isOpen, onClose, onSubmit, isLoading, deuda }: Props) => {
  const isEditMode = !!deuda;

  const [nombre, setNombre] = useState(DEFAULT_FORM.nombre);
  const [tipoDeuda, setTipoDeuda] = useState<"CICLICA" | "DEFINIDA">(DEFAULT_FORM.tipoDeuda);
  const [frecuencia, setFrecuencia] = useState(DEFAULT_FORM.frecuencia);
  const [montoUsd, setMontoUsd] = useState(DEFAULT_FORM.montoUsd);
  const [montoBs, setMontoBs] = useState(DEFAULT_FORM.montoBs);
  const [montoEur, setMontoEur] = useState(DEFAULT_FORM.montoEur);
  const [categoriaId, setCategoriaId] = useState<number | "">(DEFAULT_FORM.categoriaId);
  const [fechaInicio, setFechaInicio] = useState(DEFAULT_FORM.fechaInicio);
  const [fechaFin, setFechaFin] = useState(DEFAULT_FORM.fechaFin);
  const [color, setColor] = useState(DEFAULT_FORM.color);
  const [icono, setIcono] = useState(DEFAULT_FORM.icono);
  const [cuotasTotales, setCuotasTotales] = useState(DEFAULT_FORM.cuotasTotales);
  const [activa, setActiva] = useState(DEFAULT_FORM.activa);
  const [crearCategoriaDedicada, setCrearCategoriaDedicada] = useState(true);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    obtenerTodasCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));

    if (deuda) {
      setNombre(deuda.nombre);
      setTipoDeuda(deuda.tipoDeuda);
      setFrecuencia(deuda.frecuencia);
      setMontoUsd(deuda.montoUsd != null ? String(deuda.montoUsd) : "");
      setMontoBs(deuda.montoBs != null ? String(deuda.montoBs) : "");
      setMontoEur(deuda.montoEur != null ? String(deuda.montoEur) : "");
      setCategoriaId(deuda.categoria?.id ?? "");
      setFechaInicio(deuda.fechaInicio);
      setFechaFin(deuda.fechaFin ?? "");
      setColor(deuda.color);
      setIcono(deuda.icono);
      setCuotasTotales(deuda.cuotasTotales != null ? String(deuda.cuotasTotales) : "");
      setActiva(deuda.activa);
      setCrearCategoriaDedicada(false);
    } else {
      setNombre(DEFAULT_FORM.nombre);
      setTipoDeuda(DEFAULT_FORM.tipoDeuda);
      setFrecuencia(DEFAULT_FORM.frecuencia);
      setMontoUsd(DEFAULT_FORM.montoUsd);
      setMontoBs(DEFAULT_FORM.montoBs);
      setMontoEur(DEFAULT_FORM.montoEur);
      setCategoriaId(DEFAULT_FORM.categoriaId);
      setFechaInicio(new Date().toISOString().split("T")[0]);
      setFechaFin(DEFAULT_FORM.fechaFin);
      setColor(DEFAULT_FORM.color);
      setIcono(DEFAULT_FORM.icono);
      setCuotasTotales(DEFAULT_FORM.cuotasTotales);
      setActiva(DEFAULT_FORM.activa);
      setCrearCategoriaDedicada(true);
    }
  }, [isOpen, deuda]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const base = {
      nombre,
      tipoDeuda,
      frecuencia,
      montoUsd: montoUsd ? Number(montoUsd) : null,
      montoBs: montoBs ? Number(montoBs) : null,
      montoEur: montoEur ? Number(montoEur) : null,
      categoriaId: !isEditMode && crearCategoriaDedicada ? null : (categoriaId !== "" ? categoriaId : null),
      crearCategoriaDedicada: !isEditMode && crearCategoriaDedicada,
      fechaInicio,
      fechaFin: fechaFin || null,
      color,
      icono,
      cuotasTotales: cuotasTotales ? Number(cuotasTotales) : null,
    };

    if (isEditMode) {
      if (!base.categoriaId) return;
      onSubmit({ ...base, activa });
    } else {
      if (!crearCategoriaDedicada && !base.categoriaId) return;
      onSubmit(base);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditMode ? "Editar Deuda" : "Nueva Deuda"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Ej. Netflix, Préstamo auto..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Tipo</label>
              <select
                value={tipoDeuda}
                onChange={(e) => setTipoDeuda(e.target.value as "CICLICA" | "DEFINIDA")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="CICLICA">Cíclica</option>
                <option value="DEFINIDA">Definida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Frecuencia</label>
              <select
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="MENSUAL">Mensual</option>
                <option value="SEMANAL">Semanal</option>
                <option value="UNA_VEZ">Una vez</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Monto USD</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoUsd}
                onChange={(e) => setMontoUsd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Monto Bs</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoBs}
                onChange={(e) => setMontoBs(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Monto EUR</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoEur}
                onChange={(e) => setMontoEur(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />
            </div>
          </div>

          {tipoDeuda === "DEFINIDA" && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Cuotas totales</label>
              <input
                type="number"
                min="1"
                value={cuotasTotales}
                onChange={(e) => setCuotasTotales(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Fecha fin (opcional)</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
            <label className="block text-sm font-bold text-slate-600">Categoría vinculada</label>
            {!isEditMode && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={crearCategoriaDedicada}
                  onChange={(e) => setCrearCategoriaDedicada(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm text-slate-700">Crear categoría dedicada (recomendado)</span>
              </label>
            )}
            {(!crearCategoriaDedicada || isEditMode) && (
              <>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.filter(c => c.tipo === 'EGRESO').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Cada deuda activa debe tener una categoría única para el auto-match.</p>
              </>
            )}
            {!isEditMode && crearCategoriaDedicada && (
              <p className="text-xs text-slate-500">
                Se creará la categoría "{nombre || '...'}" con el color e ícono de esta deuda.
              </p>
            )}
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Estado</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiva(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
                    activa
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Activa
                </button>
                <button
                  type="button"
                  onClick={() => setActiva(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
                    !activa
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Inactiva
                </button>
              </div>
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl cursor-text"
                required
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emj) => (
                <button
                  key={emj}
                  type="button"
                  onClick={() => setIcono(emj)}
                  className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg transition-colors cursor-pointer"
                >
                  {emj}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !nombre || !icono || (!isEditMode && !crearCategoriaDedicada && categoriaId === "") || (isEditMode && categoriaId === "")}
              className="flex-1 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Deuda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
