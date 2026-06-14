"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSesionConAsistencias(sesionId: number) {
  return prisma.sesion.findUnique({
    where: { id: sesionId },
    include: {
      grupoCurso: {
        include: { grupo: true, curso: true },
      },
      leccion: true,
      maestro: true,
      asistencias: {
        include: { alumno: true },
        orderBy: { alumno: { nombre: "asc" } },
      },
    },
  });
}

export async function updateAsistenciasBulk(
  sesionId: number,
  asistencias: {
    id: number;
    asistio: boolean;
    trajoBiblia: boolean;
    capitulosLeidos?: number;
    diasAyuno?: number;
    visitasRealizadas?: number;
    observaciones?: string;
  }[]
) {
  // Prisma no soporta un bulk update con diferentes valores fácilmente en SQLite/Postgres de una sola vez
  // Pero podemos usar transacciones
  const transactions = asistencias.map((a) =>
    prisma.asistencia.update({
      where: { id: a.id },
      data: {
        asistio: a.asistio,
        trajoBiblia: a.trajoBiblia,
        capitulosLeidos: a.capitulosLeidos,
        diasAyuno: a.diasAyuno,
        visitasRealizadas: a.visitasRealizadas,
        observaciones: a.observaciones,
      },
    })
  );

  await prisma.$transaction(transactions);
  
  revalidatePath(`/asistencia/${sesionId}`);
  revalidatePath("/sesiones");
  return true;
}
