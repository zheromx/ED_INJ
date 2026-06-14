"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createCurso, updateCurso, deleteCurso } from "@/app/actions/cursos";
import { useRouter } from "next/navigation";

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
import { Plus, Edit2, Trash2, Search, Library } from "lucide-react";

const formSchema = z.object({
  nombreCurso: z.string().min(2, "El nombre es requerido"),
  descripcion: z.string().optional(),
});

type Curso = {
  id: number;
  nombreCurso: string;
  descripcion: string | null;
  activo: boolean;
  _count: { lecciones: number };
};

export function CursosClient({ initialData }: { initialData: Curso[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCurso: "",
      descripcion: "",
    },
  });

  const filteredData = initialData.filter((c) => 
    c.nombreCurso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateCurso(editingId, values);
        toast.success("Curso actualizado correctamente");
      } else {
        await createCurso(values);
        toast.success("Curso creado correctamente");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingId(curso.id);
    form.reset({
      nombreCurso: curso.nombreCurso,
      descripcion: curso.descripcion || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este curso?")) {
      try {
        await deleteCurso(id);
        toast.success("Curso eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar curso");
      }
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({ nombreCurso: "", descripcion: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" /> Nuevo Curso</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreCurso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Curso *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {editingId ? "Guardar Cambios" : "Crear Curso"}
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
              <TableHead>Nombre del Curso</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Lecciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No se encontraron cursos.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((curso) => (
                <TableRow key={curso.id}>
                  <TableCell className="font-medium">{curso.nombreCurso}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{curso.descripcion || "-"}</TableCell>
                  <TableCell>{curso._count.lecciones}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/lecciones?cursoId=${curso.id}`)}>
                      <Library className="h-4 w-4 mr-2" /> Ver Lecciones
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(curso)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(curso.id)}>
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
