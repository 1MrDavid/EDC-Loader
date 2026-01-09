import { type CuentaDTO } from "../../types/finance";

interface Props {
  cuenta: CuentaDTO;
}

export const CuentaCard = ({ cuenta }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1rem",
        minWidth: "220px",
      }}
    >
      <h4>{cuenta.cuenta}</h4>
      <p>N° {cuenta.numero}</p>
    </div>
  );
};
