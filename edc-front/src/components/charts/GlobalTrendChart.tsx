import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { type BalanceGlobalMensualDTO } from '../../types/finance';
import { Button } from '@/components/ui/button';

interface Props {
  data: BalanceGlobalMensualDTO[];
}

const SELECT_CLASS =
  "flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const GlobalTrendChart = ({ data }: Props) => {
  const [currency, setCurrency] = useState<'BS' | 'USD'>('BS');
  
  // Estado para controlar cuántos meses mostrar. 12 es un buen estándar visual.
  // El valor 0 representará "Histórico completo"
  const [monthsToShow, setMonthsToShow] = useState<number>(12);

  const dataKeys = {
    ingresos: currency === 'BS' ? 'totalIngresos' as const : 'totalIngresosDolar' as const,
    egresos: currency === 'BS' ? 'totalEgresos' as const : 'totalEgresosDolar' as const,
    symbol: currency === 'BS' ? 'Bs.' : '$'
  };

  // Lógica de filtrado: Cortamos el array para tomar solo los últimos N meses
  // Si monthsToShow es 0, pasamos la data completa
  const displayData = monthsToShow === 0 
    ? data 
    : data.slice(-monthsToShow);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-foreground font-bold text-lg">Evolución de Ingresos vs Egresos</h3>
          <p className="text-muted-foreground text-xs">Comparativa histórica mensual</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={monthsToShow}
            onChange={(e) => setMonthsToShow(Number(e.target.value))}
            className={SELECT_CLASS}
          >
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
            <option value={0}>Histórico completo</option>
          </select>

          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            <Button
              type="button"
              size="xs"
              variant={currency === 'BS' ? 'secondary' : 'ghost'}
              onClick={() => setCurrency('BS')}
            >
              Bs.
            </Button>
            <Button
              type="button"
              size="xs"
              variant={currency === 'USD' ? 'secondary' : 'ghost'}
              onClick={() => setCurrency('USD')}
            >
              USD
            </Button>
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="periodo" 
              tickFormatter={(date) => {
                const d = new Date(date + 'T00:00:00');
                return d.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' });
              }}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) return '0';
                return `${dataKeys.symbol}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`;
              }}
            />
            
            <Tooltip 
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any) => {
                const numericValue = typeof value === 'number' ? value : 0;
                return [
                  `${dataKeys.symbol} ${new Intl.NumberFormat('es-VE', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  }).format(numericValue)}`, 
                  ''
                ];
              }}
              labelFormatter={(label) => {
                const d = new Date(label + 'T00:00:00');
                return d.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
              }}
            />
            
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            
            <Bar 
              name="Ingresos" 
              dataKey={dataKeys.ingresos} 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={24} 
            />
            <Bar 
              name="Egresos" 
              dataKey={dataKeys.egresos} 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              barSize={24} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
