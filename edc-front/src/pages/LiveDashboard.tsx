import { useState } from "react";
import { useBotRecords } from "../hooks/useBotRecords";
import { EditBotModal } from "../components/modals/EditBotModal";
import { CategoryBadge } from "../components/cards/CategoryBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { type RegistroBotDTO } from "../types/finance";

export const LiveDashboard = () => {
  const { records, isLoading, isError } = useBotRecords();
  const [selectedRecord, setSelectedRecord] = useState<RegistroBotDTO | null>(null);
  
  const [currency, setCurrency] = useState<'BS' | 'USD'>('BS');

  if (isLoading) return <div className="p-8 text-slate-500">Cargando registros en vivo...</div>;
  if (isError) return <div className="p-8 text-rose-500">Error conectando con el servidor.</div>;

  // 1. FILTRAR LA CATEGORÍA "Trx a mi mismo" (ID: 6) PARA LAS MÉTRICAS
  const validRecords = records.filter(r => r.categoria?.id !== 6);

  // 2. TOTALES EN DÓLARES (Usando validRecords y montoDolar)
  const totalPendientes = records.length; // Mantiene el conteo total visual
  const montoFlotanteEgresos = validRecords.filter(r => !r.esIngreso).reduce((acc, curr) => acc + (curr.montoDolar || 0), 0);
  const montoFlotanteIngresos = validRecords.filter(r => r.esIngreso).reduce((acc, curr) => acc + (curr.montoDolar || 0), 0);

  // 3. AGRUPACIÓN PARA GRÁFICOS (Usando validRecords)
  const categoriasCountMap = validRecords.reduce((acc, curr) => {
    const catName = curr.categoria?.nombre || "Sin Asignar";
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoriasMontoMapUsd = validRecords.reduce((acc, curr) => {
    const catName = curr.categoria?.nombre || "Sin Asignar";
    acc[catName] = (acc[catName] || 0) + (curr.montoDolar || 0);
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];
  
  const chartDataCount = Object.keys(categoriasCountMap).map((key, i) => ({
    name: key, value: categoriasCountMap[key], color: COLORS[i % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  const chartDataMontoUsd = Object.keys(categoriasMontoMapUsd).map((key, i) => ({
    name: key, value: categoriasMontoMapUsd[key], color: COLORS[i % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  const dailyMap = validRecords.reduce((acc, curr) => {
    if (!acc[curr.fecha]) {
      acc[curr.fecha] = { fecha: curr.fecha, ingresosBs: 0, egresosBs: 0, ingresosUsd: 0, egresosUsd: 0 };
    }
    if (curr.esIngreso) {
      acc[curr.fecha].ingresosBs += curr.monto;
      acc[curr.fecha].ingresosUsd += (curr.montoDolar || 0);
    } else {
      acc[curr.fecha].egresosBs += curr.monto;
      acc[curr.fecha].egresosUsd += (curr.montoDolar || 0);
    }
    return acc;
  }, {} as Record<string, any>);
  const barData = Object.values(dailyMap).sort((a: any, b: any) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">En Vivo</h1>
          <p className="text-slate-500 text-sm">Registros extraídos pendientes de consolidación.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-100/80 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes:</span>
            <span className="font-mono font-bold text-slate-800">{totalPendientes}</span>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">+ USD:</span>
            <span className="font-mono font-bold text-emerald-700">${montoFlotanteIngresos.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="bg-rose-50/80 border border-rose-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">- USD:</span>
            <span className="font-mono font-bold text-rose-700">${montoFlotanteEgresos.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="col-span-1 lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flujo Diario</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setCurrency('BS')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${currency === 'BS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bs.
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${currency === 'USD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                USD
              </button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => currency === 'BS' ? `${(val/1000).toFixed(0)}k` : `$${val.toFixed(0)}`} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  formatter={(val: number) => currency === 'BS' ? `Bs. ${val.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `$${val.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                />
                <Bar dataKey={currency === 'BS' ? "ingresosBs" : "ingresosUsd"} name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey={currency === 'BS' ? "egresosBs" : "egresosUsd"} name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-64 flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transacciones (Q)</span>
          <div className="flex-1 flex items-center justify-between min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartDataCount} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {chartDataCount.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-2 overflow-y-auto max-h-full pl-2">
              {chartDataCount.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="truncate flex-1">{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-64 flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Volumen ($)</span>
          <div className="flex-1 flex items-center justify-between min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartDataMontoUsd} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {chartDataMontoUsd.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} 
                    formatter={(val: number) => `$${val.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-2 overflow-y-auto max-h-full pl-2">
              {chartDataMontoUsd.map(d => (
                <div key={d.name} className="flex flex-col text-[10px] text-slate-600 border-b border-slate-50 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="truncate flex-1 font-semibold">{d.name}</span>
                  </div>
                  <span className="text-slate-400 pl-4">${d.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Tipo & Ref</th>
                <th className="px-6 py-4">Contexto / Beneficiario</th>
                <th className="px-6 py-4">Bancos</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Monto (Bs / $)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className="block font-semibold text-slate-700">{r.tipo}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{r.fecha}</span>
                    <button 
                      onClick={() => setSelectedRecord(r)}
                      className="text-blue-500 hover:text-blue-700 hover:underline font-mono text-xs mt-1 transition"
                    >
                      Ref: {r.referencia || 'N/A'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs">
                    <span className="block font-semibold text-slate-900 truncate">{r.concepto || "Sin concepto"}</span>
                    <span className="block text-xs text-slate-500 truncate mt-0.5">{r.beneficiario}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{r.bancoOrigen || '---'}</span>
                    <span className="mx-1 text-slate-300">→</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{r.bancoDestino || '---'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {r.categoria ? (
                       <CategoryBadge categoria={r.categoria} />
                    ) : (
                      <button onClick={() => setSelectedRecord(r)} className="text-xs font-medium text-slate-400 border border-dashed border-slate-300 rounded-full px-3 py-1 hover:bg-slate-50 hover:text-blue-500 hover:border-blue-300 transition">
                        + Categoría
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`block text-sm font-bold ${r.esIngreso ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.esIngreso ? '+' : '-'}{r.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                    </span>
                    <span className={`block text-xs font-medium mt-0.5 ${r.esIngreso ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {r.esIngreso ? '+' : '-'}${r.montoDolar?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditBotModal 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        registro={selectedRecord} 
      />
    </div>
  );
};