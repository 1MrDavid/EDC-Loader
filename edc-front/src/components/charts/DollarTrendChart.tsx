import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { type ValorDolarDTO } from "../../types/finance";

interface Props {
  data: ValorDolarDTO[];
}

export const DollarTrendChart = ({ data }: Props) => {
  const chartData = [...data]
    .sort((a, b) => {
      const dateA = new Date(a.ano, a.mes - 1, a.dia);
      const dateB = new Date(b.ano, b.mes - 1, b.dia);
      return dateA.getTime() - dateB.getTime();
    })
    .map((item) => ({
      ...item,
      dateLabel: new Date(item.ano, item.mes - 1, item.dia)
        .toLocaleDateString("es-VE", { day: "numeric", month: "short" }),
      fullDate: new Date(item.ano, item.mes - 1, item.dia)
        .toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" }),
    }));

  return (
    <div>
      <h3 className="text-card-foreground font-bold text-lg mb-6">Evolución de la Tasa (BCV)</h3>

      {chartData.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-muted-foreground">
          No hay tasas registradas para este año.
        </div>
      ) : (
        <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />

            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />

            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `Bs. ${val}`}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "var(--muted-foreground)", marginBottom: "0.5rem" }}
              formatter={(value: number | undefined) => {
                if (value === undefined || value === null) {
                  return ["Bs. 0,00", "Tasa"];
                }
                return [
                  `Bs. ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(value)}`,
                  "Tasa",
                ];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
            />

            <Line
              type="monotone"
              dataKey="precio"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
