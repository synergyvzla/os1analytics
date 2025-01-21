import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

export const Dashboard = () => {
  const { data: leadsCount, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['propertiesCount'],
    queryFn: async () => {
      console.log('Fetching count...');
      const { data, count, error } = await supabase
        .from('Propiedades')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Error fetching count:', error);
        throw error;
      }

      console.log('Query result:', { data, count });
      return count || 0;
    }
  });

  const { data: uniqueZipCount, isLoading: isLoadingZips } = useQuery({
    queryKey: ['uniqueZipCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Propiedades')
        .select('address_zip')
        .not('address_zip', 'is', null);
      
      if (error) {
        console.error('Error fetching zip codes:', error);
        throw error;
      }

      const uniqueZips = new Set(data.map(item => item.address_zip));
      return uniqueZips.size;
    }
  });

  const { data: scoreDistribution, isLoading: isLoadingScores } = useQuery({
    queryKey: ['scoreDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Propiedades')
        .select('combined_score');

      if (error) {
        console.error('Error fetching scores:', error);
        throw error;
      }

      // Count occurrences of each score
      const distribution = data.reduce((acc: Record<number, number>, curr) => {
        if (curr.combined_score) {
          acc[curr.combined_score] = (acc[curr.combined_score] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to array format for chart
      return Object.entries(distribution).map(([score, count]) => ({
        score: `Score ${score}`,
        count: count
      }));
    }
  });

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cantidad de potenciales leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingLeads ? "Cargando..." : leadsCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Códigos Zips mapeados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingZips ? "Cargando..." : uniqueZipCount}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Score de propiedades</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoadingScores ? (
                  <p className="text-center">Cargando...</p>
                ) : (
                  <ChartContainer
                    className="w-full h-full"
                    config={{
                      score: {
                        theme: {
                          light: "#1e3a8a",
                          dark: "#3b82f6"
                        }
                      }
                    }}
                  >
                    <BarChart data={scoreDistribution}>
                      <XAxis dataKey="score" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar
                        dataKey="count"
                        fill="var(--color-score)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  );
};