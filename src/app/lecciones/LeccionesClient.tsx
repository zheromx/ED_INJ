"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createLeccion, updateLeccion, deleteLeccion } from "@/app/actions/lecciones";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";

const formSchema = z.object({
  cursoId: z.string().min(1, "Debe seleccionar un curso"),
  numeroLeccion: z.coerce.number().min(1, "El número debe ser mayor a 0"),
  titulo: z.string().min(2, "El título es requerido"),
  descripcion: z.string().optional(),
});

type Curso = { id: number; nombreCurso: string };
type Leccion = {
  id: number;
  cursoId: number;
  numeroLeccion: number;
  titulo: string;
  descripcion: string | null;
  curso: Curso;
};

export function LeccionesClient({
  initialData,
  cursos,
  defaultCursoId,
}: {
  initialData: Leccion[];
  cursos: Curso[];
  defaultCursoId?: string;
}) {
  const [selectedCursoId, setSelectedCursoId] = useState<string>(defaultCursoId || "all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      cursoId: defaultCursoId || "",
      numeroLeccion: 1,
      titulo: "",
      descripcion: "",
    },
  });

  const filteredData = initialData.filter((l) =>
    selectedCursoId === "all" ? true : l.cursoId.toString() === selectedCursoId
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const dataToSave = {
        ...values,
        cursoId: parseInt(values.cursoId),
      };

      if (editingId) {
        await updateLeccion(editingId, dataToSave);
        toast.success("Lección actualizada correctamente");
      } else {
        await createLeccion(dataToSave);
        toast.success("Lección creada correctamente");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleEdit = (leccion: Leccion) => {
    setEditingId(leccion.id);
    form.reset({
      cursoId: leccion.cursoId.toString(),
      numeroLeccion: leccion.numeroLeccion,
      titulo: leccion.titulo,
      descripcion: leccion.descripcion || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta lección? (Será borrada permanentemente)")) {
      try {
        await deleteLeccion(id);
        toast.success("Lección eliminada correctamente");
      } catch (error) {
        toast.error("Error al eliminar lección");
      }
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({
      cursoId: selectedCursoId !== "all" ? selectedCursoId : "",
      numeroLeccion: 1,
      titulo: "",
      descripcion: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center">
        <div className="w-72">
          <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Curso..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Cursos</SelectItem>
              {cursos.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombreCurso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" /> Nueva Lección</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Lección" : "Nueva Lección"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccionar Curso" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cursos.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombreCurso}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-[100px_1fr] gap-4">
                  <FormField
                    control={form.control}
                    name="numeroLeccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número *</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingId ? "Guardar Cambios" : "Crear Lección"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No se encontraron lecciones.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((leccion) => (
                <TableRow key={leccion.id}>
                  <TableCell className="font-medium text-muted-foreground">{leccion.curso.nombreCurso}</TableCell>
                  <TableCell>{leccion.numeroLeccion}</TableCell>
                  <TableCell className="font-medium">{leccion.titulo}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{leccion.descripcion || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(leccion)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(leccion.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
