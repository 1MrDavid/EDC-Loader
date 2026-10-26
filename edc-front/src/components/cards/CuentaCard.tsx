import { type CuentaDTO } from "../../types/finance";

interface Props {
  cuenta: CuentaDTO;
}

export const CuentaCard = ({ cuenta }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 min-w-[220px] text-card-foreground">
      <h4>{cuenta.cuenta}</h4>
      <p className="text-muted-foreground text-sm">N° {cuenta.numero}</p>
    </div>
  );
};
