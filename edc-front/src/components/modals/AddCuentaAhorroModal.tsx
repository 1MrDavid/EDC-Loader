import { useEffect, useState, type FormEvent } from "react";
import {
  type ActualizarCuentaAhorroDTO,
  type CrearCuentaAhorroDTO,
  type CuentaAhorroDTO,
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
  onSubmit: (data: CrearCuentaAhorroDTO | ActualizarCuentaAhorroDTO) => void;
  isLoading: boolean;
  cuenta?: CuentaAhorroDTO | null;
}

const MONEDAS = ["USD", "USDT", "Bs", "EUR"];
const EMOJIS = ["💰", "🏦", "💵", "🪙", "📈", "🔒", "🎯", "💳"];
const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Billetera" : "Nueva Billetera"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="nombre-billetera">Nombre</Label>
            <Input
              id="nombre-billetera"
              type="text"
              placeholder="Ej. Binance, Efectivo USD, Ahorro..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-moneda">Moneda</Label>
            <select
              id="tipo-moneda"
              value={tipoMoneda}
              onChange={(e) => setTipoMoneda(e.target.value)}
              className={SELECT_CLASS}
            >
              {MONEDAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="saldo-inicial">Saldo inicial</Label>
              <Input
                id="saldo-inicial"
                type="number"
                step="0.01"
                min="0"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="color-billetera">Color</Label>
              <Input
                id="color-billetera"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 cursor-pointer p-1"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="icono-billetera">Ícono</Label>
              <Input
                id="icono-billetera"
                type="text"
                maxLength={2}
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className="text-center text-xl"
                required
              />
            </div>
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !nombre || !icono} className="flex-1 sm:flex-1">
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Billetera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
