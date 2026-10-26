import { useEffect, useState, type FormEvent } from "react";
import { obtenerTodasCategorias } from "../../services/bankingService";
import { type ActualizarDeudaDTO, type CategoriaDTO, type CrearDeudaDTO, type DeudaDTO } from "../../types/finance";
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
  onSubmit: (data: CrearDeudaDTO | ActualizarDeudaDTO) => void;
  isLoading: boolean;
  deuda?: DeudaDTO | null;
}

const EMOJIS = ["💳", "🏠", "📱", "🚗", "💡", "🎬", "🏋️", "📺", "🛡️", "💰"];
const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deuda-nombre">Nombre</Label>
            <Input
              id="deuda-nombre"
              type="text"
              placeholder="Ej. Netflix, Préstamo auto..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deuda-tipo">Tipo</Label>
              <select
                id="deuda-tipo"
                value={tipoDeuda}
                onChange={(e) => setTipoDeuda(e.target.value as "CICLICA" | "DEFINIDA")}
                className={SELECT_CLASS}
              >
                <option value="CICLICA">Cíclica</option>
                <option value="DEFINIDA">Definida</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deuda-frecuencia">Frecuencia</Label>
              <select
                id="deuda-frecuencia"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="MENSUAL">Mensual</option>
                <option value="SEMANAL">Semanal</option>
                <option value="QUINCENAL">Quincenal</option>
                <option value="UNA_VEZ">Una vez</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deuda-usd">Monto USD</Label>
              <Input
                id="deuda-usd"
                type="number"
                step="0.01"
                min="0"
                value={montoUsd}
                onChange={(e) => setMontoUsd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deuda-bs">Monto Bs</Label>
              <Input
                id="deuda-bs"
                type="number"
                step="0.01"
                min="0"
                value={montoBs}
                onChange={(e) => setMontoBs(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deuda-eur">Monto EUR</Label>
              <Input
                id="deuda-eur"
                type="number"
                step="0.01"
                min="0"
                value={montoEur}
                onChange={(e) => setMontoEur(e.target.value)}
              />
            </div>
          </div>

          {tipoDeuda === "DEFINIDA" && (
            <div className="space-y-2">
              <Label htmlFor="deuda-cuotas">Cuotas totales</Label>
              <Input
                id="deuda-cuotas"
                type="number"
                min="1"
                value={cuotasTotales}
                onChange={(e) => setCuotasTotales(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deuda-inicio">Fecha inicio</Label>
              <Input
                id="deuda-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deuda-fin">Fecha fin (opcional)</Label>
              <Input
                id="deuda-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted p-4">
            <Label>Categoría vinculada</Label>
            {!isEditMode && (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={crearCategoriaDedicada}
                  onChange={(e) => setCrearCategoriaDedicada(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm text-foreground">Crear categoría dedicada (recomendado)</span>
              </label>
            )}
            {(!crearCategoriaDedicada || isEditMode) && (
              <>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}
                  className={SELECT_CLASS}
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.filter(c => c.tipo === 'EGRESO').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Cada deuda activa debe tener una categoría única para el auto-match.</p>
              </>
            )}
            {!isEditMode && crearCategoriaDedicada && (
              <p className="text-xs text-muted-foreground">
                Se creará la categoría "{nombre || '...'}" con el color e ícono de esta deuda.
              </p>
            )}
          </div>

          {isEditMode && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiva(true)}
                  className={`flex-1 ${
                    activa
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  Activa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiva(false)}
                  className={`flex-1 ${
                    !activa
                      ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  Inactiva
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="deuda-color">Color</Label>
              <Input
                id="deuda-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 cursor-pointer p-1"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="deuda-icono">Ícono</Label>
              <Input
                id="deuda-icono"
                type="text"
                maxLength={2}
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className="text-center text-xl"
                required
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emj) => (
                <Button
                  key={emj}
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  onClick={() => setIcono(emj)}
                >
                  {emj}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !nombre || !icono || (!isEditMode && !crearCategoriaDedicada && categoriaId === "") || (isEditMode && categoriaId === "")}
              className="flex-1 sm:flex-1"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Deuda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
