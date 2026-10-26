import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerAniosDolar, obtenerHistorialDolar } from "../services/bankingService";
import { DollarTrendChart } from "../components/charts/DollarTrendChart";
import { DollarHistoryTable } from "../components/tables/DollarHistoryTable";
import { Card, CardContent } from "@/components/ui/card";

const SELECT_CLASS =
  "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export const DollarPage = () => {
  const [selectedYear, setSelectedYear] = useState<number>();

  const { data: aniosDisponibles = [], isSuccess: aniosLoaded } = useQuery({
    queryKey: ["dolarAnios"],
    queryFn: obtenerAniosDolar,
  });

  useEffect(() => {
    if (!aniosLoaded || selectedYear != null) return;
    setSelectedYear(aniosDisponibles[0] ?? new Date().getFullYear());
  }, [aniosLoaded, aniosDisponibles, selectedYear]);

  const { data, isLoading } = useQuery({
    queryKey: ["dolarHistory", selectedYear],
    queryFn: () => obtenerHistorialDolar(selectedYear),
    enabled: selectedYear != null,
  });

  if (isLoading || selectedYear == null) {
    return <div className="p-10 text-center text-muted-foreground">Cargando tasas...</div>;
  }

  const dollarData = data || [];

  const sortedByDate = [...dollarData].sort((a, b) => {
    const dateA = new Date(a.ano, a.mes - 1, a.dia);
    const dateB = new Date(b.ano, b.mes - 1, b.dia);
    return dateB.getTime() - dateA.getTime();
  });
  const currentRate = sortedByDate[0]?.precio || 0;
  const lastUpdate = sortedByDate[0]
    ? new Date(sortedByDate[0].ano, sortedByDate[0].mes - 1, sortedByDate[0].dia).toLocaleDateString("es-VE")
    : "-";

  const yearOptions = aniosDisponibles.length > 0 ? aniosDisponibles : [selectedYear];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitor Dolar</h1>
          <p className="text-muted-foreground text-sm">Histórico de la tasa oficial de cambio.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <Card className="bg-card border-border text-card-foreground shadow-sm py-0">
            <CardContent className="px-6 py-3 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Tasa Actual</p>
                <p className="text-2xl font-bold text-foreground">Bs. {currentRate}</p>
                <p className="text-[10px] text-muted-foreground">Al {lastUpdate}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border text-card-foreground shadow-sm">
          <CardContent className="p-6">
            <DollarTrendChart data={dollarData} />
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <DollarHistoryTable data={dollarData} />
        </div>
      </div>
    </div>
  );
};
