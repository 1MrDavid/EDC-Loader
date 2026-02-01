import { useState } from "react";
import { type ValorDolarDTO } from "../../types/finance";

interface Props {
  data: ValorDolarDTO[];
}

export const DollarHistoryTable = ({ data }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Ordenamos la data de la más reciente a la más antigua para la tabla
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.ano, a.mes - 1, a.dia);
    const dateB = new Date(b.ano, b.mes - 1, b.dia);
    return dateB.getTime() - dateA.getTime(); // Descendente
  });

  // Paginación Cliente
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const currentData = sortedData.slice(
    currentPage * pageSize, 
    (currentPage + 1) * pageSize
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg">Histórico de Tasas</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold">Fecha</th>
              <th className="px-6 py-4 font-bold text-right">Precio (Bs/$)</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => {
              // Cálculo simple de variación vs el día anterior (solo visual)
              // Nota: Esto es aproximado ya que depende del orden de la lista completa
              return (
                <tr key={item.fecha} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {new Date(item.ano, item.mes - 1, item.dia).toLocaleDateString('es-VE', { 
                      day: '2-digit', month: 'long', year: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    Bs. {item.precio.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                </tr>
              );
            })}
            
            {currentData.length === 0 && (
               <tr><td colSpan={3} className="p-8 text-center text-slate-400">No hay datos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de Paginación */}
      <div className="p-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-500">
          Página {currentPage + 1} de {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 text-xs font-medium border rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 text-xs font-medium border rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};