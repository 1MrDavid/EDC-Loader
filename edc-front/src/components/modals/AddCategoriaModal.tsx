import { useEffect, useState, type FormEvent } from "react";
import {
  type ActualizarCategoriaDTO,
  type CategoriaResumenMesDTO,
  type CrearCategoriaDTO,
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
  onSubmit: (data: CrearCategoriaDTO | ActualizarCategoriaDTO) => void;
  isLoading: boolean;
  categoria?: CategoriaResumenMesDTO | null;
}

const EMOJIS = ["🛒", "💡", "🍔", "🚗", "🏠", "💊", "🎉", "💰", "📱", "✈️"];

const DEFAULT_FORM = {
  nombre: "",
  tipo: "EGRESO" as "INGRESO" | "EGRESO",
  color: "#64748b",
  icono: "🏷️",
};

export const AddCategoriaModal = ({ isOpen, onClose, onSubmit, isLoading, categoria }: Props) => {
  const isEditMode = !!categoria;
  const [nombre, setNombre] = useState(DEFAULT_FORM.nombre);
  const [tipo, setTipo] = useState<"INGRESO" | "EGRESO">(DEFAULT_FORM.tipo);
  const [color, setColor] = useState(DEFAULT_FORM.color);
  const [icono, setIcono] = useState(DEFAULT_FORM.icono);

  useEffect(() => {
    if (!isOpen) return;

    if (categoria) {
      setNombre(categoria.nombre);
      setTipo(categoria.tipo);
      setColor(categoria.color);
      setIcono(categoria.icono);
    } else {
      setNombre(DEFAULT_FORM.nombre);
      setTipo(DEFAULT_FORM.tipo);
      setColor(DEFAULT_FORM.color);
      setIcono(DEFAULT_FORM.icono);
    }
  }, [isOpen, categoria]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, tipo, color, icono });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej. Restaurantes, Transporte..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Movimiento</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipo === "EGRESO" ? "default" : "outline"}
                onClick={() => setTipo("EGRESO")}
                className="flex-1"
              >
                Egreso
              </Button>
              <Button
                type="button"
                variant={tipo === "INGRESO" ? "default" : "outline"}
                onClick={() => setTipo("INGRESO")}
                className="flex-1"
              >
                Ingreso
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="color">Color Identificador</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <span className="text-xs font-mono uppercase text-muted-foreground">{color}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="icono">Ícono (Emoji)</Label>
              <Input
                id="icono"
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
            <Button type="submit" disabled={isLoading || !nombre || !icono} className="flex-1 sm:flex-1">
              {isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
