"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Library,
  Network,
  CalendarDays,
  CheckSquare,
  BarChart3,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Alumnos", href: "/alumnos", icon: Users },
  { title: "Maestros", href: "/maestros", icon: GraduationCap },
  { title: "Cursos", href: "/cursos", icon: BookOpen },
  { title: "Lecciones", href: "/lecciones", icon: Library },
  { title: "Grupos", href: "/grupos", icon: Users },
  { title: "Asignaciones", href: "/asignaciones", icon: Network },
  { title: "Sesiones", href: "/sesiones", icon: CalendarDays },
  { title: "Asistencia", href: "/asistencia", icon: CheckSquare },
  { title: "Reportes", href: "/reportes", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <h2 className="text-lg font-bold">Control Asistencias</h2>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
