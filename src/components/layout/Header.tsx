"use client";

import { usePathname } from "next/navigation";

const routes: Record<string, string> = {
  "/": "Dashboard",
  "/alumnos": "Alumnos",
  "/maestros": "Maestros",
  "/cursos": "Cursos",
  "/lecciones": "Lecciones",
  "/grupos": "Grupos",
  "/asignaciones": "Asignaciones",
  "/sesiones": "Sesiones",
  "/asistencia": "Captura de Asistencia",
  "/reportes": "Reportes",
};

export function Header() {
  const pathname = usePathname();
  
  // Encontrar el título basado en la ruta (manejo básico para rutas anidadas)
  let title = "Dashboard";
  const matchedRoute = Object.keys(routes).find((route) => 
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  
  if (matchedRoute) {
    title = routes[matchedRoute];
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
}
