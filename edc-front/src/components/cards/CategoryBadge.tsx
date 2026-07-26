interface Props {
    categoria: {
      nombre: string;
      color: string;
      icono: string;
    };
  }
  
  export const CategoryBadge = ({ categoria }: Props) => {
    // Convertimos un hex como #ef4444 a un estilo en línea para el fondo y texto
    return (
      <span 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
        style={{ 
          backgroundColor: `${categoria.color}15`, // 15 es opacidad en hex para un fondo suave
          color: categoria.color,
          border: `1px solid ${categoria.color}30`
        }}
      >
        <span>{categoria.icono}</span>
        {categoria.nombre}
      </span>
    );
  };