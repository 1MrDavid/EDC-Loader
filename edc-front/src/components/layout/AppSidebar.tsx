import { Link, useLocation } from "react-router-dom"
import {
  Banknote,
  CreditCard,
  FolderUp,
  LayoutDashboard,
  PiggyBank,
  Tags,
  Wallet,
  Zap,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Operación",
    items: [
      { path: "/", label: "En Vivo", icon: Zap },
      { path: "/historial", label: "Visión General", icon: LayoutDashboard },
      { path: "/cargar", label: "Cargar Archivos", icon: FolderUp },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { path: "/cuentas-ahorro", label: "Billeteras", icon: Wallet },
      { path: "/deudas", label: "Deudas", icon: CreditCard },
      { path: "/ahorros-limites", label: "Metas y Límites", icon: PiggyBank },
    ],
  },
  {
    label: "Configuración",
    items: [
      { path: "/categorias", label: "Categorías", icon: Tags },
      { path: "/divisas", label: "Valor Dólar", icon: Banknote },
    ],
  },
]

function isActivePath(pathname: string, path: string) {
  if (path === "/") {
    return pathname === "/"
  }
  if (path === "/historial") {
    return pathname === "/historial" || pathname.startsWith("/cuenta/")
  }
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-black">
                  E
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black tracking-tight">
                    EDC<span className="text-blue-600">Pro</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Finanzas personales
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(location.pathname, item.path)}
                      tooltip={item.label}
                    >
                      <Link to={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                AH
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">AH</span>
                <span className="truncate text-xs text-muted-foreground">
                  Usuario
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
