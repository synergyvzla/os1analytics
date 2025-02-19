
import { LogOut, User, LayoutDashboard, Users, FileText, Building, Settings } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useRole } from "@/hooks/useRole"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { isSuperUser } = useRole();

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Well Done Mitigation</h2>
                <p className="text-sm text-muted-foreground">Enterprise</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className={isActive("/dashboard") ? "bg-secondary text-secondary-foreground" : ""}
                >
                  <button onClick={() => navigate("/dashboard")} className="w-full">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className={isActive("/crm") ? "bg-secondary text-secondary-foreground" : ""}
                >
                  <button onClick={() => navigate("/crm")} className="w-full">
                    <Users className="h-4 w-4" />
                    <span>CRM</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className={isActive("/docs") ? "bg-secondary text-secondary-foreground" : ""}
                >
                  <button onClick={() => navigate("/docs")} className="w-full">
                    <FileText className="h-4 w-4" />
                    <span>Documentación</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isSuperUser && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className={isActive("/admin") ? "bg-secondary text-secondary-foreground" : ""}
                  >
                    <button onClick={() => navigate("/admin")} className="w-full">
                      <Settings className="h-4 w-4" />
                      <span>Administración</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-secondary">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {userEmail?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left">
                  <span className="text-sm font-medium">{userEmail}</span>
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
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
