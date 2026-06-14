import { getMaestros } from "@/app/actions/maestros";
import { MaestrosClient } from "./MaestrosClient";

export const dynamic = "force-dynamic";
export default async function MaestrosPage() {
  const maestros = await getMaestros();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Maestros</h2>
        <p className="text-muted-foreground">Administra el catálogo de maestros.</p>
      </div>
      <MaestrosClient initialData={maestros} />
    </div>
  );
}
