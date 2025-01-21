import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const usePropertyFilters = () => {
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [selectedScores, setSelectedScores] = useState<string[]>([]);
  const [zipSearchQuery, setZipSearchQuery] = useState("");
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");
  const [isZipDropdownOpen, setIsZipDropdownOpen] = useState(false);
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.5383, lng: -81.3792 });
  const [mapZoom, setMapZoom] = useState(9);
  const [priceRange, setPriceRange] = useState([250000, 900000]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(2025, 0, 17),
  });

  const { data: availableZipCodes } = useQuery({
    queryKey: ['availableZipCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Propiedades')
        .select('address_zip')
        .not('address_zip', 'is', null);
      
      if (error) throw error;
      const uniqueZips = Array.from(new Set(data.map(item => item.address_zip))).sort();
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
    queryKey: ['properties', selectedZips, selectedScores, date, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('Propiedades')
        .select('*')
        .gte('valuation_estimatedValue', priceRange[0])
        .lte('valuation_estimatedValue', priceRange[1]);
      
      if (selectedZips.length > 0) {
        query = query.in('address_zip', selectedZips.map(zip => parseInt(zip, 10)));
      }

      if (selectedScores.length > 0) {
        query = query.in('combined_score', selectedScores.map(score => parseInt(score, 10)));
      }

      if (date?.from) {
        query = query.gte('top_gust_1_date', date.from.toISOString());
      }

      if (date?.to) {
        query = query.lte('top_gust_1_date', date.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length === 0) {
        // Get min and max valuation values
        const { data: minData } = await supabase
          .from('Propiedades')
          .select('valuation_estimatedValue')
          .order('valuation_estimatedValue', { ascending: true })
          .limit(1);

        const { data: maxData } = await supabase
          .from('Propiedades')
          .select('valuation_estimatedValue')
          .order('valuation_estimatedValue', { ascending: false })
          .limit(1);

        // Get min and max dates
        const { data: dateData } = await supabase
          .from('Propiedades')
          .select('top_gust_1_date')
          .not('top_gust_1_date', 'is', null)
          .order('top_gust_1_date', { ascending: true });

        if (minData?.[0] && maxData?.[0] && dateData?.length) {
          const minValue = minData[0].valuation_estimatedValue;
          const maxValue = maxData[0].valuation_estimatedValue;
          const minDate = new Date(dateData[0].top_gust_1_date);
          const maxDate = new Date(dateData[dateData.length - 1].top_gust_1_date);
          
          const formatPrice = (value: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(value);
          };

          toast({
            title: "No hay propiedades en el rango seleccionado",
            description: `Prueba con valores entre ${formatPrice(minValue)} y ${formatPrice(maxValue)}\nFechas disponibles: ${format(minDate, "dd MMM, yyyy", { locale: es })} - ${format(maxDate, "dd MMM, yyyy", { locale: es })}`,
            duration: 5000,
          });
        }
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
    handleZipSelect,
    handleScoreSelect,
    removeZip,
    removeScore,
    date,
    setDate,
    priceRange,
    setPriceRange,
  };
};