import { useState } from "react";
import { type MovimientoDTO } from "../../types/finance";
import { CategoryBadge } from "../cards/CategoryBadge";
import { AssignCategoryModal } from "../modals/AssignCategoryModal";

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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Descripción / Concepto</th>
                <th className="px-6 py-4">Contraparte</th>
                <th className="px-6 py-4 text-right">Monto (Bs)</th>
                <th className="px-6 py-4 text-right">Monto ($)</th>
                <th className="px-6 py-4 text-center">Tasa</th>
                <th className="px-6 py-4 text-center">Saldo</th>
                <th className="px-6 py-4">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Fecha */}
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {m.fechaefec || m.fechavalor}
                  </td>
                  
                  {/* Concepto / Ref */}
                  <td className="px-6 py-4 text-sm max-w-xs">
                    <span className="font-medium text-slate-900 block truncate" title={m.descripcion}>
                      {m.descripcion}
                    </span>
                    <span className="text-xs text-slate-400">Ref: {m.referencia || 'N/A'}</span>
                  </td>
                  
                  {/* NUEVA COLUMNA: Contraparte Agrupada */}
                  <td className="px-6 py-4 text-sm min-w-[200px]">
                    {m.beneficiario ? (
                      <>
                        <span className="font-medium text-slate-800 block">{m.beneficiario}</span>
                        <span className="text-xs text-slate-500 block">
                          {m.identificacion} {m.telefono ? `• ${m.telefono}` : ''}
                        </span>
                        <span className="text-xs text-slate-400">{m.bancoDestino}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Sin datos extra</span>
                    )}
                  </td>
                  
                  {/* Monto Bs */}
                  <td className={`px-6 py-4 text-sm text-right font-medium whitespace-nowrap ${m.ingreso ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.ingreso ? `+${m.ingreso.toFixed(2)}` : `-${m.egreso?.toFixed(2)}`}
                  </td>
                  
                  {/* Monto $ */}
                  <td className={`px-6 py-4 text-sm text-right font-medium whitespace-nowrap ${m.ingresodolar ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.ingresodolar 
                    ? `+${formatUSD(m.ingresodolar)}` 
                    : `-${formatUSD(m.egresodolar || 0)}`}
                  </td>
                  
                  {/* Tasa */}
                  <td className="px-6 py-4 text-sm text-center text-slate-500 font-mono">
                    {m.tasadolar?.toFixed(2) ?? "-"}
                  </td>
                  
                  {/* Saldo */}
                  <td className="px-6 py-4 text-sm text-center text-slate-500 font-mono">
                    {m.saldo?.toFixed(2) ?? "-"}
                  </td>
                  
                  {/* Categoría */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {m.categoria ? (
                      <CategoryBadge categoria={m.categoria} />
                    ) : (
                      <button
                          onClick={() => setSelectedMovimiento(m)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-semibold px-3 py-1 border border-dashed border-blue-200 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap"
                        >
                          + Asignar
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación (Se mantiene igual) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Página <span className="font-semibold text-slate-700">{currentPage + 1}</span> de <span className="font-semibold text-slate-700">{totalPages}</span>
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
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