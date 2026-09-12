import { useState, type FormEvent } from "react";
import { type CrearCuentaDTO } from "../../types/finance";
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
  onSubmit: (data: CrearCuentaDTO) => void;
  isLoading: boolean;
}

export const AddAccountModal = ({ isOpen, onClose, onSubmit, isLoading }: Props) => {
  const [banco, setBanco] = useState("");
  const [numero, setNumero] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ banco, numero });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Nueva Cuenta Bancaria</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="banco">Nombre del Banco</Label>
            <Input
              id="banco"
              type="text"
              placeholder="Ej. Banesco, Mercantil, BFC..."
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Número de Cuenta</Label>
            <Input
              id="numero"
              type="text"
              placeholder="0100..."
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !banco || !numero} className="flex-1 sm:flex-1">
              {isLoading ? "Guardando..." : "Guardar Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
