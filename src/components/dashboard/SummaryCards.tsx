import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const SummaryCards = () => {
  const { data: leadsCount, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['propertiesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('Propiedades')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
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
      
      if (error) throw error;
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

      if (error) throw error;

      const distribution = data.reduce((acc: Record<number, number>, curr) => {
        if (curr.combined_score) {
          acc[curr.combined_score] = (acc[curr.combined_score] || 0) + 1;
        }
        return acc;
      }, {});

      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      return Object.entries(distribution).map(([score, count]) => ({
        score: `Score ${score}`,
        count,
        percentage: Math.round((count / total) * 100)
      }));
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Score de propiedades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingScores ? (
            <p className="text-center">Cargando...</p>
          ) : (
            scoreDistribution?.map((item) => (
              <div key={item.score} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.score}</span>
                  <span>{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};