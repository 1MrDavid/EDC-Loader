import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Clock3, Landmark, RefreshCw, Smartphone, type LucideIcon } from "lucide-react";
import { useBotRecords } from "../hooks/useBotRecords";
import { forzarConciliacionBot } from "../services/bankingService";
import { EditBotModal } from "../components/modals/EditBotModal";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { type RegistroBotDTO } from "../types/finance";
import { CategoryBadge } from "../components/cards/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getTransactionIcon(tipo: string): LucideIcon {
  const normalized = tipo.toLowerCase();
  if (normalized.includes("móvil") || normalized.includes("movil")) return Smartphone;
  if (normalized.includes("transfer")) return ArrowRightLeft;
  return Landmark;
}

export const LiveDashboard = () => {
  const queryClient = useQueryClient();
  const { records, isLoading, isError } = useBotRecords();
  const [selectedRecord, setSelectedRecord] = useState<RegistroBotDTO | null>(null);

  const conciliacionMutation = useMutation({
    mutationFn: forzarConciliacionBot,
    onSuccess: (data) => {
      alert(`Se conciliaron ${data.conciliados} registro(s).`);
      queryClient.invalidateQueries({ queryKey: ["bot-records"] });
      queryClient.invalidateQueries({ queryKey: ["registros-bot"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    },
    onError: () => {
      alert("Error al ejecutar la conciliación.");
    },
  });
  
  const [currency, setCurrency] = useState<'BS' | 'USD'>('BS');

  if (isLoading) return <div className="p-8 text-muted-foreground">Cargando registros en vivo...</div>;
  if (isError) return <div className="p-8 text-destructive">Error conectando con el servidor.</div>;

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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">En Vivo</h1>
        <p className="text-sm text-muted-foreground">Registros extraídos pendientes de consolidación.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalPendientes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos flotantes</CardTitle>
            <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              ${montoFlotanteIngresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Egresos flotantes</CardTitle>
            <ArrowDownRight className="size-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              ${montoFlotanteEgresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
      <div className="order-2 grid grid-cols-1 gap-6 lg:order-1 lg:grid-cols-4">
        <Card className="h-72 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flujo Diario</CardTitle>
            <CardAction className="static justify-self-auto">
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
            </CardAction>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => currency === 'BS' ? `${(val/1000).toFixed(0)}k` : `$${val.toFixed(0)}`} 
                />
                <Tooltip 
                  cursor={{ fill: "var(--muted)" }} 
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }} 
                  formatter={(val: number) => currency === 'BS' ? `Bs. ${val.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `$${val.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                />
                <Bar dataKey={currency === 'BS' ? "ingresosBs" : "ingresosUsd"} name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey={currency === 'BS' ? "egresosBs" : "egresosUsd"} name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-72">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones (Q)</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 items-center justify-between">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartDataCount} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {chartDataCount.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--popover)", color: "var(--popover-foreground)", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex max-h-full w-1/2 flex-col gap-2 overflow-y-auto pl-2">
              {chartDataCount.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="font-bold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-72">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Volumen ($)</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 items-center justify-between">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartDataMontoUsd} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {chartDataMontoUsd.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--popover)", color: "var(--popover-foreground)", fontSize: "12px" }} 
                    formatter={(val: number) => `$${val.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex max-h-full w-1/2 flex-col gap-2 overflow-y-auto pl-2">
              {chartDataMontoUsd.map(d => (
                <div key={d.name} className="flex flex-col border-b border-border pb-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="flex-1 truncate font-semibold text-foreground">{d.name}</span>
                  </div>
                  <span className="pl-4">${d.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="order-1 lg:order-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Registros Pendientes del Bot</CardTitle>
            <CardDescription>Cruza movimientos bancarios con registros de Telegram.</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => conciliacionMutation.mutate()}
            disabled={conciliacionMutation.isPending}
          >
            <RefreshCw className={conciliacionMutation.isPending ? "animate-spin" : ""} />
            {conciliacionMutation.isPending ? "Conciliando..." : "Forzar Conciliación"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="px-6 text-xs uppercase">Tipo & Ref</TableHead>
                <TableHead className="px-6 text-xs uppercase">Contexto / Beneficiario</TableHead>
                <TableHead className="px-6 text-xs uppercase">Bancos</TableHead>
                <TableHead className="px-6 text-xs uppercase">Categoría</TableHead>
                <TableHead className="px-6 text-right text-xs uppercase">Monto (Bs / $)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => {
                const TypeIcon = getTransactionIcon(r.tipo);
                return (
                <TableRow key={r.id}>
                  <TableCell className="px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <TypeIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-semibold text-foreground">{r.tipo}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{r.fecha}</span>
                        <Button
                          type="button"
                          variant="link"
                          size="xs"
                          className="h-auto px-0 font-mono text-xs"
                          onClick={() => setSelectedRecord(r)}
                        >
                          Ref: {r.referencia || 'N/A'}
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal px-6">
                    <span className="block truncate font-semibold text-foreground">{r.concepto || "Sin concepto"}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{r.beneficiario}</span>
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="font-mono text-xs text-muted-foreground">{r.bancoOrigen || '---'}</span>
                    <span className="mx-1 text-muted-foreground/60">→</span>
                    <span className="font-mono text-xs text-muted-foreground">{r.bancoDestino || '---'}</span>
                  </TableCell>
                  <TableCell className="whitespace-normal px-6">
                    <div className="flex flex-col items-start gap-1.5">
                      {r.categoria ? (
                        <CategoryBadge categoria={r.categoria} />
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="rounded-full border-dashed"
                          onClick={() => setSelectedRecord(r)}
                        >
                          + Categoría
                        </Button>
                      )}
                      {r.deudaNombre && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Pago: {r.deudaNombre}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 text-right whitespace-nowrap">
                    <span className={`block text-sm font-bold ${r.esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {r.esIngreso ? '+' : '-'}{r.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                    </span>
                    <span className={`mt-0.5 block text-xs font-medium opacity-80 ${r.esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {r.esIngreso ? '+' : '-'}${r.montoDolar?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>

          <div className="block md:hidden divide-y divide-border">
            {records.map((r) => {
              const TypeIcon = getTransactionIcon(r.tipo);
              return (
                <div
                  key={r.id}
                  className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(r)}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <TypeIcon className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {r.concepto || r.beneficiario || "Sin concepto"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {r.tipo}
                      <span className="mx-1">→</span>
                      {r.bancoDestino || "---"}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.categoria && <CategoryBadge categoria={r.categoria} />}
                      {r.deudaNombre && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Pago: {r.deudaNombre}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-sm font-bold ${r.esIngreso ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {r.esIngreso ? "+" : "-"}{r.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.esIngreso ? "+" : "-"}${r.montoDolar?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>

      <EditBotModal 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        registro={selectedRecord} 
      />
    </div>
  );
};
