import { type MovimientoDTO } from "../../types/finance";

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
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* ... tu thead existente ... */}
          <tbody className="divide-y divide-slate-100">
        {data.map(m => (
          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-600">{m.fechaefec}</td>
            <td className="px-6 py-4 text-sm">
              <span className="font-medium text-slate-900 block">{m.descripcion}</span>
              <span className="text-xs text-slate-400">Ref: {m.referencia || 'N/A'}</span>
            </td>
            <td className={`px-6 py-4 text-sm text-right font-medium ${m.ingreso ? 'text-emerald-600' : 'text-rose-600'}`}>
              {m.ingreso ? `+${m.ingreso}` : `-${m.egreso}`}
            </td>
            <td className={`px-6 py-4 text-sm text-right font-medium ${m.ingresodolar ? 'text-emerald-600' : 'text-rose-600'}`}>
              {m.ingresodolar 
              ? `+${formatUSD(m.ingresodolar)}` 
              : `-${formatUSD(m.egresodolar || 0)}`}
            </td>
            <td className="px-6 py-4 text-sm text-center text-slate-500 font-mono">
              {m.tasadolar?.toFixed(2) ?? "-"}
            </td>
            <td className="px-6 py-4 text-sm text-center text-slate-500 font-mono">
              {m.saldo?.toFixed(2) ?? "-"}
            </td>
          </tr>
          ))}
          </tbody>
        </table>
      </div>

    {/* CONTROLES DE PAGINACIÓN RECUPERADOS */}
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
  );
};