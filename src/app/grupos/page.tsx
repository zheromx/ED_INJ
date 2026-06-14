import { getGrupos } from "@/app/actions/grupos";
import { getMaestros } from "@/app/actions/maestros";
import { GruposClient } from "./GruposClient";

export default async function GruposPage() {
  const [grupos, maestros] = await Promise.all([
    getGrupos(),
    getMaestros(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Grupos</h2>
        <p className="text-muted-foreground">Administra los grupos de alumnos y sus maestros.</p>
      </div>
      <GruposClient initialData={grupos} maestros={maestros} />
    </div>
  );
}
