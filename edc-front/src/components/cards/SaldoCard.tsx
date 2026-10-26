export const SaldoCard = ({ titulo, monto, moneda }: { titulo: string; monto: number; moneda: string }) => (
  <div className="bg-card border border-border p-8 rounded-2xl flex-1 min-w-75">
    <h3 className="text-muted-foreground text-sm font-medium mb-3">{titulo}</h3>
    <p className="text-3xl font-bold text-card-foreground">
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: moneda }).format(monto)}
    </p>
  </div>
);
