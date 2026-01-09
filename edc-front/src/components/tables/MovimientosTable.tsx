import { type MovimientoDTO } from "../../types/finance";

interface Props {
  data: MovimientoDTO[];
}

export const MovimientosTable = ({ data }: Props) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
          <th className="px-6 py-4 font-semibold">Fecha</th>
          <th className="px-6 py-4 font-semibold">Descripción / Referencia</th>
          <th className="px-6 py-4 font-semibold text-right">Monto (BS)</th>
          <th className="px-6 py-4 font-semibold text-right">Monto (USD)</th>
          <th className="px-6 py-4 font-semibold text-center">Tasa</th>
          <th className="px-6 py-4 font-semibold text-center">Saldo</th>
        </tr>
      </thead>
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
              {m.ingresodolar ? `+$${m.ingresodolar}` : `-$${m.egresodolar}`}
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
  );
};