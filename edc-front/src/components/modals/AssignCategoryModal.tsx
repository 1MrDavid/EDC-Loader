import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type MovimientoDTO, type CrearReglaDTO } from "../../types/finance";
import { obtenerTodasCategorias, crearReglaCategorizacion, asignarCategoriaMovimiento } from "../../services/bankingService";
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
  movimiento: MovimientoDTO | null;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const AssignCategoryModal = ({ isOpen, onClose, movimiento }: Props) => {
  const queryClient = useQueryClient();
  
  // Estados del modal
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [createRule, setCreateRule] = useState(false);
  
  // Estados para la regla
  const [ruleType, setRuleType] = useState<"CONCEPTO" | "REFERENCIA">("CONCEPTO");
  const [rulePattern, setRulePattern] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Cargar las categorías (solo si el modal está abierto)
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: obtenerTodasCategorias,
    enabled: isOpen,
  });

  // Pre-llenar el patrón cuando se abre el modal y se marca la regla
  useEffect(() => {
    if (movimiento) {
      setRulePattern(ruleType === "CONCEPTO" ? movimiento.descripcion : (movimiento.referencia || ""));
    }
  }, [movimiento, ruleType]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedCategoryId(null);
      setCreateRule(false);
      setFeedback(null);
    }
  }, [isOpen]);

  // Filtrar categorías por el buscador
  const filteredCategories = useMemo(() => {
    return categorias.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categorias, searchTerm]);

  // Mutación centralizada
  const mutation = useMutation({
    mutationFn: async () => {
      if (!movimiento || !selectedCategoryId) return;

      if (createRule) {
        const dto: CrearReglaDTO = {
          patron: rulePattern.trim(),
          tipoPatron: ruleType,
          categoriaId: selectedCategoryId,
        };
        return crearReglaCategorizacion(dto);
      } else {
        await asignarCategoriaMovimiento(movimiento.id, selectedCategoryId);
        return null;
      }
    },
    onSuccess: (reglaResult) => {
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-deuda"] });

      if (reglaResult) {
        const total = reglaResult.movimientosActualizados + reglaResult.registrosBotActualizados;
        if (total === 0) {
          alert(`Regla creada. Se aplicará cuando haya coincidencias con "${reglaResult.patron}".`);
        } else {
          alert(
            `Regla aplicada: ${reglaResult.movimientosActualizados} movimiento(s) y ${reglaResult.registrosBotActualizados} registro(s) en vivo categorizados.`
          );
        }
      }

      onClose();
    },
    onError: () => {
      setFeedback("Hubo un error al guardar la categoría o la regla.");
    },
  });

  return (
    <Dialog open={isOpen && !!movimiento} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Categoría</DialogTitle>
        </DialogHeader>

        {movimiento && (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Movimiento Seleccionado</p>
              <p className="font-medium text-foreground">{movimiento.descripcion}</p>
              <p className="font-mono text-sm text-muted-foreground">Monto: {movimiento.ingreso ? `+${movimiento.ingreso}` : `-${movimiento.egreso}`}</p>
            </div>

            <div>
              <Input
                type="text"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Selecciona una:</p>
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <div className="custom-scrollbar grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-2">
                  {filteredCategories.map(cat => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`h-auto justify-start gap-2 p-2 text-left ${
                        selectedCategoryId === cat.id
                          ? "border-foreground bg-muted ring-1 ring-foreground"
                          : ""
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        {cat.icono}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-foreground">{cat.nombre}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{cat.tipo}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={createRule}
                  onChange={(e) => setCreateRule(e.target.checked)}
                  className="mt-1 rounded border-input"
                />
                <div>
                  <span className="block text-sm font-medium text-foreground">Crear regla automática</span>
                  <span className="block text-xs text-muted-foreground">Los movimientos futuros que coincidan se categorizarán solos.</span>
                </div>
              </label>

              {createRule && (
                <div className="space-y-3 rounded-lg border border-border bg-muted p-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-type">Buscar coincidencia en:</Label>
                    <select
                      id="rule-type"
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value as "CONCEPTO" | "REFERENCIA")}
                      className={SELECT_CLASS}
                    >
                      <option value="CONCEPTO">Descripción</option>
                      <option value="REFERENCIA">Referencia</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-pattern">El texto debe contener:</Label>
                    <Input
                      id="rule-pattern"
                      type="text"
                      value={rulePattern}
                      onChange={(e) => setRulePattern(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Puedes borrar partes del texto para hacer la regla más general.</p>
                  </div>
                </div>
              )}
            </div>

            {feedback && (
              <div className="rounded-lg border border-rose-200 bg-rose-500/10 p-3 text-sm text-rose-700 dark:border-rose-900 dark:text-rose-400">
                {feedback}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !selectedCategoryId || (createRule && !rulePattern.trim())}
            className="flex-1 sm:flex-1"
          >
            {mutation.isPending ? 'Guardando...' : 'Aplicar Categoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
