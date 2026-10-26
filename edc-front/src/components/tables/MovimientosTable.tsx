import { useState } from "react";
import { type MovimientoDTO } from "../../types/finance";
import { CategoryBadge } from "../cards/CategoryBadge";
import { AssignCategoryModal } from "../modals/AssignCategoryModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: MovimientoDTO[];
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const formatUSD = (val: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(val);
};

export const MovimientosTable = ({ data, currentPage, totalPages, onPageChange }: Props) => {

  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoDTO | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-6 text-xs uppercase">Fecha</TableHead>
              <TableHead className="px-6 text-xs uppercase">Descripción / Concepto</TableHead>
              <TableHead className="px-6 text-xs uppercase">Contraparte</TableHead>
              <TableHead className="px-6 text-right text-xs uppercase">Monto (Bs)</TableHead>
              <TableHead className="px-6 text-right text-xs uppercase">Monto ($)</TableHead>
              <TableHead className="px-6 text-center text-xs uppercase">Tasa</TableHead>
              <TableHead className="px-6 text-center text-xs uppercase">Saldo</TableHead>
              <TableHead className="px-6 text-xs uppercase">Categoría</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(m => (
              <TableRow key={m.id}>
                <TableCell className="px-6 whitespace-nowrap text-sm text-muted-foreground">
                  {m.fechaefec || m.fechavalor}
                </TableCell>
                
                <TableCell className="px-6 max-w-xs text-sm">
                  <span className="block truncate font-medium text-foreground" title={m.descripcion}>
                    {m.descripcion}
                  </span>
                  <span className="text-xs text-muted-foreground">Ref: {m.referencia || 'N/A'}</span>
                </TableCell>
                
                <TableCell className="px-6 min-w-[200px] text-sm">
                  {m.beneficiario ? (
                    <>
                      <span className="block font-medium text-foreground">{m.beneficiario}</span>
                      <span className="block text-xs text-muted-foreground">
                        {m.identificacion} {m.telefono ? `• ${m.telefono}` : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">{m.bancoDestino}</span>
                    </>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">Sin datos extra</span>
                  )}
                </TableCell>
                
                <TableCell className={`px-6 text-right text-sm font-medium whitespace-nowrap ${m.ingreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {m.ingreso ? `+${m.ingreso.toFixed(2)}` : `-${m.egreso?.toFixed(2)}`}
                </TableCell>
                
                <TableCell className={`px-6 text-right text-sm font-medium whitespace-nowrap ${m.ingresodolar ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {m.ingresodolar 
                  ? `+${formatUSD(m.ingresodolar)}` 
                  : `-${formatUSD(m.egresodolar || 0)}`}
                </TableCell>
                
                <TableCell className="px-6 text-center text-sm font-mono text-muted-foreground">
                  {m.tasadolar?.toFixed(2) ?? "-"}
                </TableCell>
                
                <TableCell className="px-6 text-center text-sm font-mono text-muted-foreground">
                  {m.saldo?.toFixed(2) ?? "-"}
                </TableCell>
                
                <TableCell className="px-6 text-sm">
                  {m.categoria ? (
                    <CategoryBadge categoria={m.categoria} />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="rounded-full border-dashed"
                      onClick={() => setSelectedMovimiento(m)}
                    >
                      + Asignar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-6 py-4">
        <span className="text-sm text-muted-foreground">
          Página <span className="font-semibold text-foreground">{currentPage + 1}</span> de <span className="font-semibold text-foreground">{totalPages}</span>
        </span>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Anterior
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <AssignCategoryModal
        isOpen={!!selectedMovimiento}
        onClose={() => setSelectedMovimiento(null)}
        movimiento={selectedMovimiento}
      />
    </>
  );
};
