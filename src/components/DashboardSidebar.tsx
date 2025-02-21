
import { LogOut, User, LayoutDashboard, Users, FileText, Building, Settings } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useRole } from "@/hooks/useRole"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { isSuperUser, isLoading } = useRole()
  const isMobile = useIsMobile()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Sesión cerrada correctamente")
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const isActive = (path: string) => location.pathname === path

  if (isLoading) {
    return <div>Cargando...</div>
  }

  const menuItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      text: "CRM",
      icon: <Users className="h-4 w-4" />,
      path: "/crm",
    },
    {
      text: "Documentación",
      icon: <FileText className="h-4 w-4" />,
      path: "/docs",
    },
    ...(isSuperUser ? [{
      text: "Administración",
      icon: <Settings className="h-4 w-4" />,
      path: "/admin",
    }] : []),
  ]

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <Sidebar className="group/sidebar" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm overflow-hidden">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Building className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">Well Done Mitigation</h2>
                      <p className="truncate text-sm text-muted-foreground">Enterprise</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Well Done Mitigation Enterprise</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarHeader>
          <SidebarContent className="flex-1">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          asChild
                          className={isActive(item.path) ? "bg-secondary text-secondary-foreground" : ""}
                          tooltip={item.text}
                        >
                          <button onClick={() => navigate(item.path)} className="w-full">
                            {item.icon}
                            <span>{item.text}</span>
                          </button>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.text}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-secondary">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {userEmail?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left min-w-0">
                  <span className="truncate text-sm font-medium">{userEmail}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          <SidebarRail />
          <SidebarTrigger className="absolute right-0 top-3 z-20 md:hidden" />
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
