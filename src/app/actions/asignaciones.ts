"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- AlumnoGrupo ---

export async function getAlumnoGrupos() {
  return prisma.alumnoGrupo.findMany({
    where: { activo: true },
    include: {
      alumno: true,
      grupo: true,
    },
    orderBy: { fechaIngreso: "desc" },
  });
}

export async function createAlumnoGrupo(data: {
  alumnoId: number;
  grupoId: number;
}) {
  // Check if it already exists and is active
  const existing = await prisma.alumnoGrupo.findFirst({
    where: { alumnoId: data.alumnoId, grupoId: data.grupoId, activo: true },
  });
  if (existing) throw new Error("El alumno ya está en este grupo");

  const result = await prisma.alumnoGrupo.create({
    data: { ...data, fechaIngreso: new Date() },
  });
  revalidatePath("/asignaciones");
  revalidatePath("/grupos");
  return result;
}

export async function deleteAlumnoGrupo(id: number) {
  const result = await prisma.alumnoGrupo.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/asignaciones");
  revalidatePath("/grupos");
  return result;
}

// --- GrupoCurso ---

export async function getGrupoCursos() {
  return prisma.grupoCurso.findMany({
    // We don't have an 'activo' flag directly, but we have 'estado'
    include: {
      grupo: true,
      curso: true,
    },
    orderBy: { fechaInicio: "desc" },
  });
}

export async function createGrupoCurso(data: {
  grupoId: number;
  cursoId: number;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: string;
}) {
  const result = await prisma.grupoCurso.create({
    data,
  });
  revalidatePath("/asignaciones");
  return result;
}

export async function updateGrupoCursoEstado(id: number, estado: string) {
  const result = await prisma.grupoCurso.update({
    where: { id },
    data: { estado },
  });
  revalidatePath("/asignaciones");
  return result;
}
