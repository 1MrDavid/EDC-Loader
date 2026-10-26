import { useEffect, useState, type FormEvent } from "react";
import { obtenerTodasCategorias } from "../../services/bankingService";
import {
  type ActualizarLimiteDTO,
  type CategoriaDTO,
  type CrearLimiteDTO,
  type LimiteCategoriaDTO,
} from "../../types/finance";
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
  onSubmit: (data: CrearLimiteDTO | ActualizarLimiteDTO) => void;
  isLoading: boolean;
  limite?: LimiteCategoriaDTO | null;
  defaultMonth: number;
  defaultYear: number;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Límite" : "Nuevo Límite de Presupuesto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="limite-categoria">Categoría</Label>
            <select
              id="limite-categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              className={SELECT_CLASS}
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

          <div className="space-y-2">
            <Label htmlFor="limite-monto">Límite mensual (USD)</Label>
            <Input
              id="limite-monto"
              type="number"
              step="0.01"
              min="0.01"
              value={montoUsd}
              onChange={(e) => setMontoUsd(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted p-4">
            <Label>Alcance del límite</Label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={esGlobal}
                onChange={() => setEsGlobal(true)}
                className="border-input"
              />
              <span className="text-sm text-foreground">Global (todos los meses)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={!esGlobal}
                onChange={() => setEsGlobal(false)}
                className="border-input"
              />
              <span className="text-sm text-foreground">Solo un mes específico</span>
            </label>

            {!esGlobal && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="limite-mes" className="text-xs text-muted-foreground">Mes</Label>
                  <select
                    id="limite-mes"
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                    className={SELECT_CLASS}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("es", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limite-ano" className="text-xs text-muted-foreground">Año</Label>
                  <Input
                    id="limite-ano"
                    type="number"
                    min="2020"
                    max="2100"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                  />
                </div>
              </div>
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
                  Activo
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
                  Inactivo
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || categoriaId === "" || !montoUsd}
              className="flex-1 sm:flex-1"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Límite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
