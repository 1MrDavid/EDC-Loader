import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "./AppSidebar"
import { ModeToggle } from "@/components/ModeToggle"
import { ThemeProvider } from "@/components/theme-provider"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  "/": "En Vivo",
  "/historial": "Visión General",
  "/cargar": "Cargar Archivos",
  "/divisas": "Valor Dólar",
  "/categorias": "Categorías",
  "/deudas": "Deudas",
  "/cuentas-ahorro": "Billeteras",
  "/ahorros-limites": "Metas y Límites",
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/cuenta/")) {
    return "Detalle de Cuenta"
  }
  return pageTitles[pathname] ?? "Dashboard"
}

export const MainLayout = () => {
  const location = useLocation()

  return (
    <ThemeProvider defaultTheme="system" storageKey="edc-theme">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <h1 className="text-sm font-semibold">{resolveTitle(location.pathname)}</h1>
            <div className="ml-auto">
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
