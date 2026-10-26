import { useEffect, useState } from "react";
import { type ValorDolarDTO } from "../../types/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: ValorDolarDTO[];
}

export const DollarHistoryTable = ({ data }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.ano, a.mes - 1, a.dia);
    const dateB = new Date(b.ano, b.mes - 1, b.dia);
    return dateB.getTime() - dateA.getTime();
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const currentData = sortedData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [data]);

  return (
    <Card className="bg-card border-border text-card-foreground shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="p-6 border-b border-border">
        <CardTitle className="text-lg font-bold">Histórico de Tasas</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="px-6 py-4 text-xs uppercase">Fecha</TableHead>
                <TableHead className="px-6 py-4 text-right text-xs uppercase">Precio (Bs/$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => (
                <TableRow key={item.fecha}>
                  <TableCell className="px-6 py-4 font-medium text-card-foreground">
                    {new Date(item.ano, item.mes - 1, item.dia).toLocaleDateString("es-VE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-bold text-foreground">
                    Bs. {item.precio.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </TableCell>
                </TableRow>
              ))}

              {currentData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="p-8 text-center text-muted-foreground">
                    No hay datos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Página {currentPage + 1} de {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
