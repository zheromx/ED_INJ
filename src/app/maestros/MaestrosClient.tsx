"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createMaestro, updateMaestro, deleteMaestro } from "@/app/actions/maestros";

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
import { Plus, Edit2, Trash2, Search } from "lucide-react";

const formSchema = z.object({
  nombreCompleto: z.string().min(2, "El nombre es requerido"),
  telefono: z.string().optional(),
  correo: z.string().email("Correo inválido").or(z.literal("")).optional(),
});

type Maestro = {
  id: number;
  nombreCompleto: string;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
};

export function MaestrosClient({ initialData }: { initialData: Maestro[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      telefono: "",
      correo: "",
    },
  });

  const filteredData = initialData.filter((m) => 
    m.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateMaestro(editingId, values);
        toast.success("Maestro actualizado correctamente");
      } else {
        await createMaestro(values);
        toast.success("Maestro creado correctamente");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleEdit = (maestro: Maestro) => {
    setEditingId(maestro.id);
    form.reset({
      nombreCompleto: maestro.nombreCompleto,
      telefono: maestro.telefono || "",
      correo: maestro.correo || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este maestro?")) {
      try {
        await deleteMaestro(id);
        toast.success("Maestro eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar maestro");
      }
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({ nombreCompleto: "", telefono: "", correo: "" });
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
          <DialogTrigger render={<Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" /> Nuevo Maestro</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Maestro" : "Nuevo Maestro"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingId ? "Guardar Cambios" : "Crear Maestro"}
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
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No se encontraron maestros.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((maestro) => (
                <TableRow key={maestro.id}>
                  <TableCell className="font-medium">{maestro.nombreCompleto}</TableCell>
                  <TableCell>{maestro.telefono || "-"}</TableCell>
                  <TableCell>{maestro.correo || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(maestro)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(maestro.id)}>
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
