"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createAlumno, updateAlumno, deleteAlumno } from "@/app/actions/alumnos";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit2, Trash2, Search } from "lucide-react";

// Schema for validation
const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellidoPaterno: z.string().min(2, "El apellido es requerido"),
  apellidoMaterno: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  sexo: z.string().optional(),
});

type Alumno = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  fechaNacimiento: Date | null;
  sexo: string | null;
  activo: boolean;
};

export function AlumnosClient({ initialData }: { initialData: Alumno[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: "",
      sexo: "",
    },
  });

  const filteredData = initialData.filter((a) => {
    const full = `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno || ""}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const dataToSave = {
        ...values,
        fechaNacimiento: values.fechaNacimiento ? new Date(values.fechaNacimiento) : undefined,
      };

      if (editingId) {
        await updateAlumno(editingId, dataToSave);
        toast.success("Alumno actualizado correctamente");
      } else {
        await createAlumno(dataToSave);
        toast.success("Alumno creado correctamente");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingId(alumno.id);
    form.reset({
      nombre: alumno.nombre,
      apellidoPaterno: alumno.apellidoPaterno,
      apellidoMaterno: alumno.apellidoMaterno || "",
      fechaNacimiento: alumno.fechaNacimiento ? format(new Date(alumno.fechaNacimiento), "yyyy-MM-dd") : "",
      sexo: alumno.sexo || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este alumno?")) {
      try {
        await deleteAlumno(id);
        toast.success("Alumno eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar alumno");
      }
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: "",
      sexo: "",
    });
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
          <DialogTrigger render={<Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" /> Nuevo Alumno</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Alumno" : "Nuevo Alumno"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="apellidoPaterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Paterno *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellidoMaterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Materno</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Guardar Cambios" : "Crear Alumno"}
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
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Fecha Nacimiento</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No se encontraron alumnos.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((alumno) => (
                <TableRow key={alumno.id}>
                  <TableCell className="font-medium">
                    {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                  </TableCell>
                  <TableCell>
                    {alumno.fechaNacimiento ? format(new Date(alumno.fechaNacimiento), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>{alumno.sexo === "M" ? "Masculino" : alumno.sexo === "F" ? "Femenino" : "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(alumno)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(alumno.id)}>
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
