import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/integrations/supabase/client"

interface PropertyStats {
  total_properties: number
  unique_zipcodes: number
  high_risk: number
  medium_risk: number
  low_risk: number
}

const fetchPropertyStats = async (): Promise<PropertyStats> => {
  // Get total properties
  const { count: total_properties } = await supabase
    .from('Propiedades en Orlando')
    .select('*', { count: 'exact', head: true })

  // Get unique zipcodes
  const { data: zipcodes } = await supabase
    .from('Propiedades en Orlando')
    .select('address_zip')
    .not('address_zip', 'is', null)

  const unique_zipcodes = new Set(zipcodes?.map(p => p.address_zip)).size

  // Get risk distribution based on combined_score
  const { data: risk_data } = await supabase
    .from('Propiedades en Orlando')
    .select('combined_score')
    .not('combined_score', 'is', null)

  const high_risk = risk_data?.filter(p => p.combined_score >= 7).length || 0
  const medium_risk = risk_data?.filter(p => p.combined_score >= 4 && p.combined_score < 7).length || 0
  const low_risk = risk_data?.filter(p => p.combined_score < 4).length || 0

  return {
    total_properties: total_properties || 0,
    unique_zipcodes,
    high_risk,
    medium_risk,
    low_risk
  }
}

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['property-stats'],
    queryFn: fetchPropertyStats
  })

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Total de Propiedades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Códigos Postales Afectados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Riesgo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Total de Propiedades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.total_properties.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Propiedades registradas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Códigos Postales Afectados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.unique_zipcodes.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Áreas distintas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Riesgo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Alto Riesgo</p>
                        <p className="text-sm font-medium">{stats?.high_risk.toLocaleString()}</p>
                      </div>
                      <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ 
                            width: `${(stats?.high_risk || 0) / (stats?.total_properties || 1) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Riesgo Medio</p>
                        <p className="text-sm font-medium">{stats?.medium_risk.toLocaleString()}</p>
                      </div>
                      <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ 
                            width: `${(stats?.medium_risk || 0) / (stats?.total_properties || 1) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Bajo Riesgo</p>
                        <p className="text-sm font-medium">{stats?.low_risk.toLocaleString()}</p>
                      </div>
                      <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${(stats?.low_risk || 0) / (stats?.total_properties || 1) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}