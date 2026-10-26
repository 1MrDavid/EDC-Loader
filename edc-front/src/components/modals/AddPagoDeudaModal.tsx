import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { type DeudaDTO, type RegistrarPagoDeudaDTO } from "../../types/finance";
import { obtenerCuentas, obtenerCuentasAhorro } from "../../services/bankingService";
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
  onSubmit: (data: RegistrarPagoDeudaDTO) => void;
  isLoading: boolean;
  deuda: DeudaDTO | null;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const AddPagoDeudaModal = ({ isOpen, onClose, onSubmit, isLoading, deuda }: Props) => {
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split("T")[0]);
  const [montoBs, setMontoBs] = useState("");
  const [montoUsd, setMontoUsd] = useState("");
  const [origenFondos, setOrigenFondos] = useState("MANUAL");

  const { data: cuentasBancarias = [] } = useQuery({
    queryKey: ["cuentas"],
    queryFn: obtenerCuentas,
    enabled: isOpen,
  });

  const { data: billeteras = [] } = useQuery({
    queryKey: ["cuentas-ahorro"],
    queryFn: obtenerCuentasAhorro,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen || !deuda) return;
    setFechaPago(new Date().toISOString().split("T")[0]);
    setMontoBs(deuda.montoEquivalenteBs ? String(deuda.montoEquivalenteBs) : "");
    setMontoUsd(deuda.montoEquivalenteUsd ? String(deuda.montoEquivalenteUsd) : "");
    setOrigenFondos("MANUAL");
  }, [isOpen, deuda]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!deuda) return;

    const esBilletera = origenFondos.startsWith("BILLETERA:");
    onSubmit({
      deudaId: deuda.id,
      fechaPago,
      montoPagadoBs: montoBs ? Number(montoBs) : null,
      montoPagadoUsd: montoUsd ? Number(montoUsd) : null,
      origen: esBilletera ? "BILLETERA" : "MANUAL",
      cuentaAhorroId: esBilletera ? Number(origenFondos.split(":")[1]) : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              {deuda ? `${deuda.icono} ${deuda.nombre}` : "Selecciona una deuda"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="pago-origen">Origen de fondos</Label>
            <select
              id="pago-origen"
              value={origenFondos}
              onChange={(e) => setOrigenFondos(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="MANUAL">Sin debitar cuenta</option>
              <optgroup label="Billeteras">
                {billeteras.length === 0 ? (
                  <option disabled>No hay billeteras</option>
                ) : (
                  billeteras.map((b) => (
                    <option key={`BILLETERA:${b.id}`} value={`BILLETERA:${b.id}`}>
                      {b.icono} {b.nombre} · {b.tipoMoneda} {b.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </option>
                  ))
                )}
              </optgroup>
              <optgroup label="Cuentas bancarias">
                {cuentasBancarias.length === 0 ? (
                  <option disabled>No hay cuentas bancarias</option>
                ) : (
                  cuentasBancarias.map((c) => (
                    <option key={`BANCO:${c.id}`} value={`BANCO:${c.id}`}>
                      {c.cuenta} · {c.numero}
                    </option>
                  ))
                )}
              </optgroup>
            </select>
            {origenFondos.startsWith("BILLETERA:") && (
              <p className="text-xs text-muted-foreground">
                Se descontará el saldo de la billetera y se creará un egreso asociado a esta deuda.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pago-fecha">Fecha de pago</Label>
            <Input
              id="pago-fecha"
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pago-bs">Monto Bs</Label>
              <Input
                id="pago-bs"
                type="number"
                step="0.01"
                min="0"
                value={montoBs}
                onChange={(e) => setMontoBs(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pago-usd">Monto USD</Label>
              <Input
                id="pago-usd"
                type="number"
                step="0.01"
                min="0"
                value={montoUsd}
                onChange={(e) => setMontoUsd(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !deuda || (!montoBs && !montoUsd)}
              className="flex-1 sm:flex-1"
            >
              {isLoading ? "Registrando..." : "Registrar pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
