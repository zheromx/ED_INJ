import { getSesiones } from "@/app/actions/sesiones";
import { getGrupoCursos } from "@/app/actions/asignaciones";
import { getLecciones } from "@/app/actions/lecciones";
import { getMaestros } from "@/app/actions/maestros";
import { SesionesClient } from "./SesionesClient";

export const dynamic = "force-dynamic";
export default async function SesionesPage() {
  const [sesiones, grupoCursos, lecciones, maestros] = await Promise.all([
    getSesiones(),
    getGrupoCursos(), // Necesitamos los que están Activos
    getLecciones(),
    getMaestros(),
  ]);

  const activeGrupoCursos = grupoCursos.filter(gc => gc.estado === "Activo");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sesiones</h2>
        <p className="text-muted-foreground">Registra las clases impartidas y pasa asistencia.</p>
      </div>
      <SesionesClient
        initialData={sesiones}
        grupoCursos={activeGrupoCursos}
        lecciones={lecciones}
        maestros={maestros}
      />
    </div>
  );
}
