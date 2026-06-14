"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createGrupo, updateGrupo, deleteGrupo } from "@/app/actions/grupos";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Search, Users } from "lucide-react";

const formSchema = z.object({
  nombreGrupo: z.string().min(2, "El nombre es requerido"),
  descripcion: z.string().optional(),
  maestroTitularId: z.string().min(1, "Debe seleccionar un maestro titular"),
  auxiliar1Id: z.string().optional(),
  auxiliar2Id: z.string().optional(),
}).refine((data) => {
  // Evitar que el auxiliar 1 sea igual al titular
  if (data.auxiliar1Id && data.auxiliar1Id === data.maestroTitularId) return false;
  return true;
}, { message: "El auxiliar no puede ser igual al titular", path: ["auxiliar1Id"] })
.refine((data) => {
  // Evitar que el auxiliar 2 sea igual al titular o al auxiliar 1
  if (data.auxiliar2Id && (data.auxiliar2Id === data.maestroTitularId || data.auxiliar2Id === data.auxiliar1Id)) return false;
  return true;
}, { message: "El auxiliar 2 no puede ser igual al titular o auxiliar 1", path: ["auxiliar2Id"] });

type Maestro = { id: number; nombreCompleto: string };
type Grupo = {
  id: number;
  nombreGrupo: string;
  descripcion: string | null;
  maestroTitularId: number;
  auxiliar1Id: number | null;
  auxiliar2Id: number | null;
  maestroTitular: Maestro;
  auxiliar1: Maestro | null;
  auxiliar2: Maestro | null;
  _count: { alumnos: number };
};

export function GruposClient({
  initialData,
  maestros,
}: {
  initialData: Grupo[];
  maestros: Maestro[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreGrupo: "",
      descripcion: "",
      maestroTitularId: "",
      auxiliar1Id: "none",
      auxiliar2Id: "none",
    },
  });

  const filteredData = initialData.filter((g) =>
    g.nombreGrupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const dataToSave = {
        nombreGrupo: values.nombreGrupo,
        descripcion: values.descripcion,
        maestroTitularId: parseInt(values.maestroTitularId),
        auxiliar1Id: values.auxiliar1Id !== "none" && values.auxiliar1Id ? parseInt(values.auxiliar1Id) : null,
        auxiliar2Id: values.auxiliar2Id !== "none" && values.auxiliar2Id ? parseInt(values.auxiliar2Id) : null,
      };

      if (editingId) {
        await updateGrupo(editingId, dataToSave);
        toast.success("Grupo actualizado correctamente");
      } else {
        await createGrupo(dataToSave);
        toast.success("Grupo creado correctamente");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleEdit = (grupo: Grupo) => {
    setEditingId(grupo.id);
    form.reset({
      nombreGrupo: grupo.nombreGrupo,
      descripcion: grupo.descripcion || "",
      maestroTitularId: grupo.maestroTitularId.toString(),
      auxiliar1Id: grupo.auxiliar1Id?.toString() || "none",
      auxiliar2Id: grupo.auxiliar2Id?.toString() || "none",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este grupo?")) {
      try {
        await deleteGrupo(id);
        toast.success("Grupo eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar grupo");
      }
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({
      nombreGrupo: "",
      descripcion: "",
      maestroTitularId: "",
      auxiliar1Id: "none",
      auxiliar2Id: "none",
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
          <DialogTrigger render={<Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" /> Nuevo Grupo</Button>} />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Grupo" : "Nuevo Grupo"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreGrupo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Grupo *</FormLabel>
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
                <FormField
                  control={form.control}
                  name="maestroTitularId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maestro Titular *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maestros.map((m) => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.nombreCompleto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="auxiliar1Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auxiliar 1</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {maestros.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.nombreCompleto}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="auxiliar2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auxiliar 2</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {maestros.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.nombreCompleto}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Guardar Cambios" : "Crear Grupo"}
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
              <TableHead>Nombre</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>Auxiliares</TableHead>
              <TableHead>Alumnos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No se encontraron grupos.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((grupo) => (
                <TableRow key={grupo.id}>
                  <TableCell className="font-medium">
                    {grupo.nombreGrupo}
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">{grupo.descripcion}</div>
                  </TableCell>
                  <TableCell>{grupo.maestroTitular.nombreCompleto}</TableCell>
                  <TableCell className="text-sm">
                    {grupo.auxiliar1 && <div>1: {grupo.auxiliar1.nombreCompleto}</div>}
                    {grupo.auxiliar2 && <div>2: {grupo.auxiliar2.nombreCompleto}</div>}
                    {!grupo.auxiliar1 && !grupo.auxiliar2 && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>{grupo._count.alumnos}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/asignaciones?tab=alumnos&grupoId=${grupo.id}`)}>
                      <Users className="h-4 w-4 mr-2" /> Alumnos
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(grupo)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(grupo.id)}>
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
