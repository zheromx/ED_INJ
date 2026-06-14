"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAlumnos() {
  return prisma.alumno.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function createAlumno(data: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento?: Date;
  sexo?: string;
}) {
  const result = await prisma.alumno.create({
    data,
  });
  revalidatePath("/alumnos");
  return result;
}

export async function updateAlumno(
  id: number,
  data: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    fechaNacimiento?: Date;
    sexo?: string;
  }
) {
  const result = await prisma.alumno.update({
    where: { id },
    data,
  });
  revalidatePath("/alumnos");
  return result;
}

export async function deleteAlumno(id: number) {
  const result = await prisma.alumno.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/alumnos");
  return result;
}
