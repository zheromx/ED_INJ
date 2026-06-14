"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGrupos() {
  return prisma.grupo.findMany({
    where: { activo: true },
    include: {
      maestroTitular: true,
      auxiliar1: true,
      auxiliar2: true,
      _count: {
        select: { alumnos: true },
      },
    },
    orderBy: { nombreGrupo: "asc" },
  });
}

export async function createGrupo(data: {
  nombreGrupo: string;
  descripcion?: string;
  maestroTitularId: number;
  auxiliar1Id?: number | null;
  auxiliar2Id?: number | null;
}) {
  const result = await prisma.grupo.create({
    data,
  });
  revalidatePath("/grupos");
  return result;
}

export async function updateGrupo(
  id: number,
  data: {
    nombreGrupo: string;
    descripcion?: string;
    maestroTitularId: number;
    auxiliar1Id?: number | null;
    auxiliar2Id?: number | null;
  }
) {
  const result = await prisma.grupo.update({
    where: { id },
    data,
  });
  revalidatePath("/grupos");
  return result;
}

export async function deleteGrupo(id: number) {
  const result = await prisma.grupo.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/grupos");
  return result;
}
