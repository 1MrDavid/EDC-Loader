import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { type MovimientoDTO } from '../../types/finance';

interface Props {
  movimientos: MovimientoDTO[];
}

export const DailyFlowChart = ({ movimientos }: Props) => {
  
  // Procesamos los datos para agrupar ingresos y egresos por día
  const data = useMemo(() => {
    // 1. Crear un mapa con todos los días del mes (para que no queden huecos vacíos feos)
    if (movimientos.length === 0) return [];
    
    // Obtenemos el mes y año del primer movimiento para saber cuántos días generar
    const fechaRef = new Date(movimientos[0].fechavalor); // Asegúrate que fechaAdd sea parseable
    const daysInMonth = new Date(fechaRef.getFullYear(), fechaRef.getMonth() + 1, 0).getDate();
    
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      ingresos: 0,
      egresos: 0,
      date: new Date(fechaRef.getFullYear(), fechaRef.getMonth(), i + 1).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
    }));

    // 2. Rellenar con los movimientos
    movimientos.forEach(m => {
      const day = new Date(m.fechaAdd).getDate(); // Extrae el día (1-31)
      const index = day - 1;
      
      if (chartData[index]) {
        if (m.ingreso) chartData[index].ingresos += m.ingreso;
        if (m.egreso) chartData[index].egresos += m.egreso;
      }
    });

    return chartData;
  }, [movimientos]);

  return (
    <div className="h-[350px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Flujo Diario (Ingresos vs Egresos)</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            minTickGap={10}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `Bs. ${val/1000}k`} // Abreviar montos grandes
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`Bs. ${new Intl.NumberFormat('es-VE').format(value)}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
          
          {/* Barras con esquinas redondeadas arriba */}
          <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
          <Bar dataKey="egresos" name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};