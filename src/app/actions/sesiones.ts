"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSesiones() {
  return prisma.sesion.findMany({
    include: {
      grupoCurso: {
        include: { grupo: true, curso: true },
      },
      leccion: true,
      maestro: true,
      _count: {
        select: { asistencias: true },
      },
    },
    orderBy: { fechaSesion: "desc" },
  });
}

export async function createSesion(data: {
  grupoCursoId: number;
  leccionId: number;
  fechaSesion: Date;
  maestroImpartioId: number;
  ofrenda?: number;
  observaciones?: string;
}) {
  // Encontrar el grupo asociado para traer a todos los alumnos activos en este momento
  const grupoCurso = await prisma.grupoCurso.findUnique({
    where: { id: data.grupoCursoId },
    include: {
      grupo: {
        include: {
          alumnos: {
            where: { activo: true, alumno: { activo: true } }
          }
        }
      }
    }
  });

  if (!grupoCurso) throw new Error("GrupoCurso no encontrado");

  // Crear la sesión e insertar los registros de asistencia vacíos para cada alumno del grupo
  const result = await prisma.sesion.create({
    data: {
      ...data,
      asistencias: {
        create: grupoCurso.grupo.alumnos.map((ag: any) => ({
          alumnoId: ag.alumnoId,
          asistio: false,
          trajoBiblia: false,
        })),
      },
    },
  });

  revalidatePath("/sesiones");
  return result;
}

export async function updateSesion(
  id: number,
  data: {
    grupoCursoId: number;
    leccionId: number;
    fechaSesion: Date;
    maestroImpartioId: number;
    ofrenda?: number;
    observaciones?: string;
  }
) {
  const result = await prisma.sesion.update({
    where: { id },
    data,
  });
  revalidatePath("/sesiones");
  return result;
}

export async function deleteSesion(id: number) {
  // Delete asistencias first because of foreign key constraint
  await prisma.asistencia.deleteMany({
    where: { sesionId: id },
  });
  const result = await prisma.sesion.delete({
    where: { id },
  });
  revalidatePath("/sesiones");
  return result;
}
