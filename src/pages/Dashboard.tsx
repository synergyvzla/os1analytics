import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

export const Dashboard = () => {
  const { data: leadsCount, isLoading } = useQuery({
    queryKey: ['propertiesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('Propiedades en Orlando')
        .select('propertyId', { count: 'exact' });
      
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cantidad de potenciales leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoading ? "Cargando..." : leadsCount}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}