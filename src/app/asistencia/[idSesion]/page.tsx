import { getSesionConAsistencias } from "@/app/actions/asistencia";
import { AsistenciaClient } from "./AsistenciaClient";
import { notFound } from "next/navigation";

export default async function AsistenciaSesionPage(props: { params: Promise<{ idSesion: string }> }) {
  const params = await props.params;
  const idSesion = parseInt(params.idSesion);
  
  if (isNaN(idSesion)) return notFound();

  const sesion = await getSesionConAsistencias(idSesion);

  if (!sesion) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Captura de Asistencia</h2>
      </div>
      <AsistenciaClient sesion={sesion} />
    </div>
  );
}
