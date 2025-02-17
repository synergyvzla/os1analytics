
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const usePropertyFilters = () => {
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [selectedScores, setSelectedScores] = useState<string[]>([]);
  const [zipSearchQuery, setZipSearchQuery] = useState("");
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");
  const [isZipDropdownOpen, setIsZipDropdownOpen] = useState(false);
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.5383, lng: -81.3792 });
  const [mapZoom, setMapZoom] = useState(9);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);

  const { data: totalProperties } = useQuery({
    queryKey: ['totalProperties', priceRange, selectedZips, selectedScores],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('*', { count: 'exact' });
      
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000000)) {
        query = query
          .gte('valuation_estimatedValue', priceRange[0])
          .lte('valuation_estimatedValue', priceRange[1]);
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

  const { data: availableZipCodes } = useQuery({
    queryKey: ['availableZipCodes'],
    queryFn: async () => {
      // Obtener el conteo total primero
      const { count: totalCount } = await supabase
        .from('Propiedades')
        .select('*', { count: 'exact', head: true });
      
      const pageSize = 1000;
      const pages = Math.ceil((totalCount || 0) / pageSize);
      const allZips = new Set<number>();
      
      for (let page = 0; page < pages; page++) {
        const { data, error } = await supabase
          .from('Propiedades')
          .select('address_zip')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) {
          console.error('Error en página', page, error);
          continue;
        }
        
        if (data) {
          data.forEach(item => {
            if (item.address_zip != null) {
              allZips.add(item.address_zip);
            }
          });
        }
      }
      
      const uniqueZips = Array.from(allZips).sort((a, b) => a - b);
      return uniqueZips;
    }
  });

  const { data: availableScores } = useQuery({
    queryKey: ['availableScores', selectedZips],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('combined_score')
        .not('combined_score', 'is', null);
      
      if (selectedZips.length > 0) {
        query = query.in('address_zip', selectedZips.map(zip => parseInt(zip, 10)));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      const uniqueScores = Array.from(new Set(data.map(item => item.combined_score))).sort();
      return uniqueScores;
    }
  });

  const { data: properties } = useQuery({
    queryKey: ['properties', selectedZips, selectedScores, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('*');
      
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000000)) {
        query = query
          .gte('valuation_estimatedValue', priceRange[0])
          .lte('valuation_estimatedValue', priceRange[1]);
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

  const removeZip = (zip: string) => {
    setSelectedZips(prev => prev.filter(z => z !== zip));
  };

  const removeScore = (score: string) => {
    setSelectedScores(prev => prev.filter(s => s !== score));
  };

  return {
    selectedZips,
    selectedScores,
    zipSearchQuery,
    setZipSearchQuery,
    scoreSearchQuery,
    setScoreSearchQuery,
    isZipDropdownOpen,
    setIsZipDropdownOpen,
    isScoreDropdownOpen,
    setIsScoreDropdownOpen,
    mapCenter,
    mapZoom,
    availableZipCodes,
    availableScores,
    properties,
    totalProperties,
    handleZipSelect,
    handleScoreSelect,
    removeZip,
    removeScore,
    priceRange,
    setPriceRange,
  };
};
