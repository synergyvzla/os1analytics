import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useState, useMemo } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  marginTop: '20px',
  borderRadius: '8px'
};

// Centrado en Orlando, FL
const center = {
  lat: 28.5383,
  lng: -81.3792,
};

export const Dashboard = () => {
  const [selectedZip, setSelectedZip] = useState<string>('');

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

  const { data: availableZipCodes } = useQuery({
    queryKey: ['availableZipCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Propiedades')
        .select('address_zip')
        .not('address_zip', 'is', null);
      
      if (error) {
        console.error('Error fetching zip codes:', error);
        throw error;
      }

      const uniqueZips = Array.from(new Set(data.map(item => item.address_zip))).sort();
      return uniqueZips;
    }
  });

  const { data: properties } = useQuery({
    queryKey: ['properties', selectedZip],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('address_latitude, address_longitude, address_formattedStreet');
      
      if (selectedZip) {
        // Convert selectedZip to number before using it in the query
        query = query.eq('address_zip', parseInt(selectedZip, 10));
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return data;
    }
  });

  const markers = useMemo(() => {
    return properties?.map((property, index) => ({
      position: {
        lat: property.address_latitude || 0,
        lng: property.address_longitude || 0,
      },
      title: property.address_formattedStreet || `Property ${index + 1}`,
    })) || [];
  }, [properties]);

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-inter font-semibold tracking-tight mb-8">Summary</h1>
          
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

          <h2 className="text-2xl font-semibold mt-12 mb-6">Segmentación de Propiedades</h2>
          
          <div className="w-full max-w-xs">
            <Select onValueChange={setSelectedZip} value={selectedZip}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el Zipcode" />
              </SelectTrigger>
              <SelectContent>
                {availableZipCodes?.map((zip) => (
                  <SelectItem key={zip} value={zip.toString()}>
                    {zip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={11}
              options={{
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
              }}
            >
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  title={marker.title}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </DashboardSidebar>
  );
};
