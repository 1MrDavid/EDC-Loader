import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerCuentasAhorro } from "../../services/bankingService";
import {
  type ActualizarMetaDTO,
  type CrearMetaDTO,
  type MetaAhorroDTO,
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
  onSubmit: (data: CrearMetaDTO | ActualizarMetaDTO) => void;
  isLoading: boolean;
  meta?: MetaAhorroDTO | null;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="meta-nombre">Nombre</Label>
            <Input
              id="meta-nombre"
              type="text"
              placeholder="Ej. Fondo de emergencia, Viaje..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-cuenta">Cuenta vinculada</Label>
            <select
              id="meta-cuenta"
              value={cuentaAhorroId}
              onChange={(e) => setCuentaAhorroId(Number(e.target.value))}
              className={SELECT_CLASS}
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
              <p className="text-xs text-amber-600 dark:text-amber-400">Crea una billetera primero en la sección Billeteras.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-monto">Monto objetivo (USD)</Label>
            <Input
              id="meta-monto"
              type="number"
              step="0.01"
              min="0.01"
              value={montoObjetivoUsd}
              onChange={(e) => setMontoObjetivoUsd(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-fecha">Fecha límite (opcional)</Label>
            <Input
              id="meta-fecha"
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !nombre || cuentaAhorroId === "" || !montoObjetivoUsd}
              className="flex-1 sm:flex-1"
            >
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
