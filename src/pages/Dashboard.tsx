
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { CityFilter } from "@/components/dashboard/CityFilter";
import { ZipCodeFilter } from "@/components/dashboard/ZipCodeFilter";
import { ScoreFilter } from "@/components/dashboard/ScoreFilter";
import { PriceRangeFilter } from "@/components/dashboard/PriceRangeFilter";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PropertiesMap } from "@/components/dashboard/PropertiesMap";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/dashboard/PropertiesTable";
import { columns } from "@/components/dashboard/columns";
import { Separator } from "@/components/ui/separator";
import { PDFActions } from "@/components/dashboard/PDFActions";
import { Pagination } from "@/components/dashboard/Pagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const {
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
    currentPage,
    totalPages,
    handlePageChange,
  } = usePropertyFilters();

  const displayCount = properties?.length || 0;

  const { data: propertyImages, isLoading: isLoadingImages } = useQuery({
    queryKey: ['propertyImages', currentPage],
    queryFn: async () => {
      console.log("Iniciando consulta de imágenes...");
      
      const { count } = await supabase
        .from('property_images')
        .select('*', { count: 'exact', head: true });
      
      console.log("Total de imágenes en la base de datos:", count);

      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .range((currentPage - 1) * 100, currentPage * 100 - 1);

      if (error) {
        console.error("Error al obtener imágenes:", error);
        throw error;
      }

      const transformedData = data?.map(img => ({
        ...img,
        property_id: img.image_url.split('/').pop()?.split('.')[0] || img.property_id
      }));

      console.log("Imágenes obtenidas para la página actual:", transformedData?.length);
      console.log("Muestra de los primeros 5 registros transformados:", transformedData?.slice(0, 5));
      
      return transformedData;
    }
  });

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-2">
        <div className="container mx-auto space-y-2">
          <h1 className="text-lg font-inter font-semibold tracking-tight">Summary</h1>
          
          <SummaryCards />

          <h2 className="text-base font-semibold">Segmentación de Propiedades</h2>
          
          <Card className="w-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Filtros de búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-xs font-semibold mb-1.5">Ciudades</h3>
                  <CityFilter
                    selectedCities={selectedCities}
                    availableCities={availableCities}
                    searchQuery={citySearchQuery}
                    setSearchQuery={setCitySearchQuery}
                    handleCitySelect={handleCitySelect}
                    removeCity={removeCity}
                    isDropdownOpen={isCityDropdownOpen}
                    setIsDropdownOpen={setIsCityDropdownOpen}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-semibold mb-1.5">Códigos Postales</h3>
                  <ZipCodeFilter
                    selectedZips={selectedZips}
                    availableZipCodes={availableZipCodes}
                    searchQuery={zipSearchQuery}
                    setSearchQuery={setZipSearchQuery}
                    handleZipSelect={handleZipSelect}
                    removeZip={removeZip}
                    isDropdownOpen={isZipDropdownOpen}
                    setIsDropdownOpen={setIsZipDropdownOpen}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-semibold mb-1.5">Scores</h3>
                  <ScoreFilter
                    selectedScores={selectedScores}
                    availableScores={availableScores}
                    searchQuery={scoreSearchQuery}
                    setSearchQuery={setScoreSearchQuery}
                    handleScoreSelect={handleScoreSelect}
                    removeScore={removeScore}
                    isDropdownOpen={isScoreDropdownOpen}
                    setIsDropdownOpen={setIsScoreDropdownOpen}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-semibold mb-1.5">Rango de Precio Estimado</h3>
                  <PriceRangeFilter
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-baseline gap-1 text-sm font-semibold py-6">
            Mostrando <span className="text-base text-primary">{displayCount}</span> de <span className="text-base text-primary">{totalProperties}</span> propiedades
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ScrollArea className="h-[400px] w-full">
              <DataTable columns={columns} data={properties || []} />
            </ScrollArea>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />

          <PDFActions properties={properties || []} />

          <div className="py-24">
            <Separator className="my-8" />
            <PropertiesMap
              properties={properties}
              center={mapCenter}
              zoom={mapZoom}
            />
          </div>
        </div>
      </div>
    </DashboardSidebar>
  );
};
