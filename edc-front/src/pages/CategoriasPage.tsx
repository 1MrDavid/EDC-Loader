import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Edit2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  actualizarCategoria,
  crearCategoria,
  obtenerFechaMasReciente,
  obtenerResumenCategorias,
} from "../services/bankingService";
import {
  type ActualizarCategoriaDTO,
  type CategoriaResumenMesDTO,
  type CrearCategoriaDTO,
} from "../types/finance";
import { CategoryPolarChart } from "../components/charts/CategoryPolarChart";
import { AddCategoriaModal } from "../components/modals/AddCategoriaModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SELECT_CLASS =
  "flex h-10 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-foreground";

const mensajeErrorApi = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
};

export const CategoriasPage = () => {
  const queryClient = useQueryClient();
  const [isInitializingDate, setIsInitializingDate] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [filtroTipo, setFiltroTipo] = useState<"EGRESO" | "INGRESO">("EGRESO");
  const [mostrarVacias, setMostrarVacias] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaResumenMesDTO | null>(null);

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const initDate = async () => {
      try {
        const maxDateStr = await obtenerFechaMasReciente();
        if (maxDateStr) {
          const [yyyy, mm] = maxDateStr.split("-");
          setYear(Number(yyyy));
          setMonth(Number(mm));
        }
      } catch (error) {
        console.error("Error al obtener fecha reciente", error);
      } finally {
        setIsInitializingDate(false);
      }
    };
    initDate();
  }, []);

  const categoriasQueryKey = ["categorias-resumen", month, year] as const;

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: categoriasQueryKey,
    queryFn: () => obtenerResumenCategorias(month, year),
    enabled: !isInitializingDate,
  });

  const isLoading = isInitializingDate || loadingCategorias;

  const invalidarCategorias = () => {
    queryClient.invalidateQueries({ queryKey: ["categorias"] });
    queryClient.invalidateQueries({ queryKey: ["categorias-resumen"] });
    queryClient.invalidateQueries({ queryKey: ["categorias-todas"] });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoriaEditando(null);
  };

  const abrirModalCreacion = () => {
    setCategoriaEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicion = (cat: CategoriaResumenMesDTO) => {
    setCategoriaEditando(cat);
    setIsModalOpen(true);
  };

  const crearCategoriaMutation = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      invalidarCategorias();
      closeModal();
    },
    onError: (error) => {
      console.error("Error al crear categoría", error);
      alert(mensajeErrorApi(error, "Hubo un error al crear la categoría."));
    },
  });

  const actualizarCategoriaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarCategoriaDTO }) =>
      actualizarCategoria(id, data),
    onSuccess: () => {
      invalidarCategorias();
      closeModal();
    },
    onError: (error) => {
      console.error("Error al actualizar categoría", error);
      alert(mensajeErrorApi(error, "Hubo un error al actualizar la categoría."));
    },
  });

  const handleGuardarCategoria = (data: CrearCategoriaDTO | ActualizarCategoriaDTO) => {
    if (categoriaEditando) {
      actualizarCategoriaMutation.mutate({ id: categoriaEditando.id, data });
    } else {
      crearCategoriaMutation.mutate(data);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) => {
    const coincideTipo = cat.tipo === filtroTipo;
    const tieneMovimientos = cat.movimientosMes > 0;
    return coincideTipo && (mostrarVacias || tieneMovimientos);
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reorderedVisible = Array.from(categoriasFiltradas);
    const [moved] = reorderedVisible.splice(result.source.index, 1);
    reorderedVisible.splice(result.destination.index, 0, moved);

    const queue = [...reorderedVisible];
    queryClient.setQueryData<CategoriaResumenMesDTO[]>(categoriasQueryKey, (prev = []) =>
      prev.map((cat) => {
        const isVisible =
          cat.tipo === filtroTipo && (mostrarVacias || cat.movimientosMes > 0);
        return isVisible ? queue.shift()! : cat;
      })
    );
  };

  const isSaving =
    crearCategoriaMutation.isPending || actualizarCategoriaMutation.isPending;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Categorías</h1>
          <p className="text-muted-foreground text-sm">Organiza y analiza tus flujos de dinero.</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-transparent p-1 rounded-lg border border-input text-foreground">
            <button
              type="button"
              onClick={() => setFiltroTipo("EGRESO")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                filtroTipo === "EGRESO"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Egresos
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("INGRESO")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                filtroTipo === "INGRESO"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Ingresos
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={SELECT_CLASS}
              disabled={isInitializingDate}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={SELECT_CLASS}
              disabled={isInitializingDate}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMostrarVacias(!mostrarVacias)}
          >
            {mostrarVacias ? (
              <EyeOff className="size-4 mr-2" />
            ) : (
              <Eye className="size-4 mr-2" />
            )}
            {mostrarVacias ? "Ocultar vacías" : "Mostrar vacías"}
          </Button>

          <Button type="button" size="sm" onClick={abrirModalCreacion}>
            + Nueva Categoría
          </Button>
        </div>
      </div>

      <Card className="bg-card border border-border text-card-foreground shadow-sm rounded-2xl p-6 mb-8 h-[380px] gap-0">
        {isLoading || isInitializingDate ? (
          <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
            Generando gráfico...
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-4xl mb-2">📊</span>
            <p>No hay {filtroTipo.toLowerCase()}s registrados en este mes.</p>
          </div>
        ) : (
          <CategoryPolarChart data={categoriasFiltradas} />
        )}
      </Card>

      {isLoading || isInitializingDate ? (
        <div className="text-center py-10 text-muted-foreground animate-pulse">
          Cargando categorías...
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable direction="horizontal" droppableId="categorias-grid">
            {(provided) => (
              <section
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categoriasFiltradas.map((cat, index) => (
                  <Draggable key={cat.id} draggableId={cat.id.toString()} index={index}>
                    {(provided, snapshot) => {
                      const dragStyle = provided.draggableProps.style;
                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...dragStyle,
                            width:
                              snapshot.isDragging && dragStyle && "width" in dragStyle
                                ? dragStyle.width
                                : "auto",
                          }}
                          className={`bg-card p-5 rounded-2xl border transition-colors group ${
                            snapshot.isDragging
                              ? "border-primary shadow-lg ring-1 ring-primary z-50"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            {...provided.dragHandleProps}
                            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="size-4" />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirModalEdicion(cat)}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {cat.icono}
                          </div>
                          <span
                            className={`text-[10px] tracking-wider font-bold px-2 py-1 rounded-md ${
                              cat.tipo === "INGRESO"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {cat.tipo}
                          </span>
                        </div>

                        <h3 className="font-bold text-card-foreground text-lg mb-1">
                          {cat.nombre}
                        </h3>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Total del mes</p>
                            <p className="font-bold text-card-foreground">
                              ${cat.montoTotalDolar.toFixed(2)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                            {cat.movimientosMes} movs
                          </span>
                        </div>
                      </div>
                    );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </section>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <AddCategoriaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleGuardarCategoria}
        isLoading={isSaving}
        categoria={categoriaEditando}
      />
    </div>
  );
};
