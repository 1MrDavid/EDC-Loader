import { useState, type FormEvent } from "react";
import { type CrearMovimientoAhorroDTO } from "../../types/finance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>{cuentaNombre}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTipoOperacion("INGRESO")}
                className={`flex-1 ${
                  tipoOperacion === "INGRESO"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                ↓ Ingreso
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTipoOperacion("EGRESO")}
                className={`flex-1 ${
                  tipoOperacion === "EGRESO"
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                }`}
              >
                ↑ Egreso
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mov-monto">Monto</Label>
            <Input
              id="mov-monto"
              type="number"
              step="0.01"
              min="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mov-fecha">Fecha</Label>
            <Input
              id="mov-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mov-desc">Descripción</Label>
            <Input
              id="mov-desc"
              type="text"
              placeholder="Ej. Depósito mensual, retiro..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={isLoading || !monto} className="flex-1 sm:flex-1">
              {isLoading ? "Guardando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
