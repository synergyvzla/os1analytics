
import { LogOut, User, LayoutDashboard, Users, FileText, Building, Settings } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useRole } from "@/hooks/useRole"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

function DashboardSidebarContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { isSuperUser } = useRole()
  const [isExpanded, setIsExpanded] = useState(false)

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

  const menuItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      text: "CRM",
      icon: <Users className="h-5 w-5" />,
      path: "/crm",
    },
    {
      text: "Documentación",
      icon: <FileText className="h-5 w-5" />,
      path: "/docs",
    },
    ...(isSuperUser ? [{
      text: "Administración",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin",
    }] : []),
  ]

  return (
    <div 
      className={`fixed top-0 left-0 h-screen flex flex-col bg-slate-900 text-slate-200 transition-[width] duration-200 ease-out z-[100] shadow-xl ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <Building className="h-5 w-5 text-white" />
          </div>
          {isExpanded && (
            <h2 className="truncate text-sm font-semibold">Well Done Mitigation</h2>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={!isExpanded ? item.text : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.path)
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {isExpanded && (
              <span className="whitespace-nowrap">{item.text}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-blue-500">
                {userEmail?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <span className="truncate text-sm">{userEmail}</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] z-[110]">
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
      </div>
    </div>
  )
}

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRole()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebarContent />
      <main className="flex-1 overflow-auto bg-slate-50 ml-16">
        {children}
      </main>
    </div>
  )
}
