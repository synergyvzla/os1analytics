import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/DashboardSidebar"

export const Dashboard = () => {
  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">12</p>
                <p className="text-sm text-gray-600">Proyectos en curso</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Leads Nuevos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">8</p>
                <p className="text-sm text-gray-600">Últimos 7 días</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Equipo Activo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm text-gray-600">Equipos trabajando</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}