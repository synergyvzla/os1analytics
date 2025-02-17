
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const SummaryCards = () => {
  const { data: leadsCount, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['propertiesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('Propiedades')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error obteniendo conteo de propiedades:', error);
        throw error;
      }
      return count || 0;
    }
  });

  const { data: uniqueZipCount, isLoading: isLoadingZips } = useQuery({
    queryKey: ['uniqueZipCodes'],
    queryFn: async () => {
      // Utilizamos una consulta simple para obtener valores únicos
      const { data, error } = await supabase
        .from('Propiedades')
        .select('address_zip');
      
      if (error) {
        console.error('Error en consulta de ZIP codes:', error);
        throw error;
      }
      
      const uniqueZips = new Set(data?.map(item => item.address_zip).filter(Boolean));
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
        console.error('Error obteniendo distribución de scores:', error);
        throw error;
      }

      const distribution: Record<number, number> = {};
      data?.forEach(item => {
        if (item.combined_score) {
          distribution[item.combined_score] = (distribution[item.combined_score] || 0) + 1;
        }
      });

      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      return Object.entries(distribution).map(([score, count]) => ({
        score: `Score ${score}`,
        count,
        percentage: Math.round((count / total) * 100),
        color: score === '1' ? '#ea384c' : score === '2' ? '#F97316' : '#008f39'
      }));
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <Card className="shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs">Cantidad de potenciales leads</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-20">
          <p className="text-4xl font-bold text-primary">
            {isLoadingLeads ? "Cargando..." : leadsCount}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs">Códigos Zips mapeados</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-20">
          <p className="text-4xl font-bold text-primary">
            {isLoadingZips ? "Cargando..." : uniqueZipCount}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs">Score de propiedades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoadingScores ? (
            <p className="text-center text-xs">Cargando...</p>
          ) : (
            scoreDistribution?.map((item) => (
              <div key={item.score} className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span>{item.score}</span>
                  <span>{item.percentage}%</span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className={cn("h-1")}
                  indicatorClassName={cn("transition-all", {
                    "bg-[#ea384c]": item.score === "Score 1",
                    "bg-[#F97316]": item.score === "Score 2",
                    "bg-[#008f39]": item.score === "Score 3"
                  })}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
