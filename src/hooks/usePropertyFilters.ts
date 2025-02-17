import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const usePropertyFilters = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [selectedScores, setSelectedScores] = useState<string[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [zipSearchQuery, setZipSearchQuery] = useState("");
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isZipDropdownOpen, setIsZipDropdownOpen] = useState(false);
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.5383, lng: -81.3792 });
  const [mapZoom, setMapZoom] = useState(9);
  const [priceRange, setPriceRange] = useState<number[]>([250000, 2500000]);

  const { data: availableCities } = useQuery({
    queryKey: ['availableCities'],
    queryFn: async () => {
      const { count: totalCount } = await supabase
        .from('Propiedades')
        .select('*', { count: 'exact', head: true });
      
      const pageSize = 1000;
      const pages = Math.ceil((totalCount || 0) / pageSize);
      const allCities = new Set<string>();
      
      for (let page = 0; page < pages; page++) {
        const { data, error } = await supabase
          .from('Propiedades')
          .select('address_city')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) {
          console.error('Error en página', page, error);
          continue;
        }
        
        if (data) {
          data.forEach(item => {
            if (item.address_city != null) {
              allCities.add(item.address_city);
            }
          });
        }
      }
      
      return Array.from(allCities).sort();
    }
  });

  const { data: availableZipCodes } = useQuery({
    queryKey: ['availableZipCodes', selectedCities],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('address_zip');
      
      if (selectedCities.length > 0) {
        query = query.in('address_city', selectedCities);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error al obtener códigos postales:', error);
        return [];
      }
      
      const uniqueZips = Array.from(new Set(
        data
          .map(item => item.address_zip)
          .filter((zip): zip is number => zip != null)
      )).sort((a, b) => a - b);
      
      return uniqueZips;
    }
  });

  const { data: availableScores } = useQuery({
    queryKey: ['availableScores', selectedCities, selectedZips],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('combined_score')
        .not('combined_score', 'is', null);
      
      if (selectedCities.length > 0) {
        query = query.in('address_city', selectedCities);
      }
      
      if (selectedZips.length > 0) {
        query = query.in('address_zip', selectedZips.map(zip => parseInt(zip, 10)));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      const uniqueScores = Array.from(new Set(data.map(item => item.combined_score))).sort();
      return uniqueScores;
    }
  });

  const { data: totalProperties } = useQuery({
    queryKey: ['totalProperties', priceRange, selectedCities, selectedZips, selectedScores],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('*', { count: 'exact' });
      
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000000)) {
        query = query
          .gte('valuation_estimatedValue', priceRange[0])
          .lte('valuation_estimatedValue', priceRange[1]);
      }
      
      if (selectedCities.length > 0) {
        query = query.in('address_city', selectedCities);
      }
      
      if (selectedZips.length > 0) {
        query = query.in('address_zip', selectedZips.map(zip => parseInt(zip, 10)));
      }

      if (selectedScores.length > 0) {
        query = query.in('combined_score', selectedScores.map(score => parseInt(score, 10)));
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: properties } = useQuery({
    queryKey: ['properties', selectedCities, selectedZips, selectedScores, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('*');
      
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000000)) {
        query = query
          .gte('valuation_estimatedValue', priceRange[0])
          .lte('valuation_estimatedValue', priceRange[1]);
      }

      if (selectedCities.length > 0) {
        query = query.in('address_city', selectedCities);
      }
      
      if (selectedZips.length > 0) {
        query = query.in('address_zip', selectedZips.map(zip => parseInt(zip, 10)));
      }

      if (selectedScores.length > 0) {
        query = query.in('combined_score', selectedScores.map(score => parseInt(score, 10)));
      }
      
      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length === 0) {
        toast({
          description: "No hay propiedades que cumplan con los filtros seleccionados",
          duration: 5000,
        });
      }

      if (data && data.length > 0) {
        const avgLat = data.reduce((sum, prop) => sum + (prop.address_latitude || 0), 0) / data.length;
        const avgLng = data.reduce((sum, prop) => sum + (prop.address_longitude || 0), 0) / data.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
        setMapZoom(12);
      } else {
        setMapCenter({ lat: 28.5383, lng: -81.3792 });
        setMapZoom(9);
      }

      return data;
    }
  });

  const handleCitySelect = (city: string) => {
    setSelectedCities(prev => {
      if (city === 'all') {
        return prev.length === availableCities?.length ? [] : (availableCities || []);
      }
      if (prev.includes(city)) {
        return prev.filter(c => c !== city);
      }
      return [...prev, city];
    });
  };

  const handleZipSelect = (zip: string) => {
    setSelectedZips(prev => {
      if (zip === 'all') {
        return prev.length === availableZipCodes?.length ? [] : (availableZipCodes?.map(z => z.toString()) || []);
      }
      if (prev.includes(zip)) {
        return prev.filter(z => z !== zip);
      }
      return [...prev, zip];
    });
  };

  const handleScoreSelect = (score: string) => {
    setSelectedScores(prev => {
      if (score === 'all') {
        return prev.length === availableScores?.length ? [] : (availableScores?.map(s => s.toString()) || []);
      }
      if (prev.includes(score)) {
        return prev.filter(s => s !== score);
      }
      return [...prev, score];
    });
  };

  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
  };

  const removeZip = (zip: string) => {
    setSelectedZips(prev => prev.filter(z => z !== zip));
  };

  const removeScore = (score: string) => {
    setSelectedScores(prev => prev.filter(s => s !== score));
  };

  return {
    selectedCities,
    selectedZips,
    selectedScores,
    citySearchQuery,
    setCitySearchQuery,
    zipSearchQuery,
    setZipSearchQuery,
    scoreSearchQuery,
    setScoreSearchQuery,
    isCityDropdownOpen,
    setIsCityDropdownOpen,
    isZipDropdownOpen,
    setIsZipDropdownOpen,
    isScoreDropdownOpen,
    setIsScoreDropdownOpen,
    mapCenter,
    mapZoom,
    availableCities,
    availableZipCodes,
    availableScores,
    properties,
    totalProperties,
    handleCitySelect,
    handleZipSelect,
    handleScoreSelect,
    removeCity,
    removeZip,
    removeScore,
    priceRange,
    setPriceRange,
  };
};
