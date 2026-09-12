interface Props {
  categoria: {
    nombre: string;
    color?: string;
    icono: string;
  };
}

const FALLBACK_COLOR = "#64748b";

export const CategoryBadge = ({ categoria }: Props) => {
  const color = categoria.color || FALLBACK_COLOR;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-80"
      style={{
        backgroundColor: `${color}1A`,
        borderColor: `${color}33`,
        color,
      }}
    >
      <span>{categoria.icono}</span>
      {categoria.nombre}
    </div>
  );
};
