
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
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleDownload = () => {
    if (!properties || properties.length === 0) return;
    
    const headers = Object.keys(properties[0]).join(',');
    const rows = properties.map(prop => Object.values(prop).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'propiedades.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderPaginationButton = (page: number) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center",
        currentPage === page
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      )}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Botón "Anterior"
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-50 hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    // Renderizar páginas
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i));
      }
    } else {
      // Mostrar primeras páginas
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(renderPaginationButton(i));
        }
        pages.push(<span key="dots1" className="px-2">...</span>);
        pages.push(renderPaginationButton(totalPages));
      }
      // Mostrar últimas páginas
      else if (currentPage >= totalPages - 2) {
        pages.push(renderPaginationButton(1));
        pages.push(<span key="dots2" className="px-2">...</span>);
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(renderPaginationButton(i));
        }
      }
      // Mostrar páginas del medio
      else {
        pages.push(renderPaginationButton(1));
        pages.push(<span key="dots1" className="px-2">...</span>);
        pages.push(renderPaginationButton(currentPage - 1));
        pages.push(renderPaginationButton(currentPage));
        pages.push(renderPaginationButton(currentPage + 1));
        pages.push(<span key="dots2" className="px-2">...</span>);
        pages.push(renderPaginationButton(totalPages));
      }
    }

    // Botón "Siguiente"
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-50 hover:bg-accent"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        {pages}
      </div>
    );
  };

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
            Mostrando <span className="text-base text-primary">{displayCount}</span> propiedades
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ScrollArea className="h-[400px] w-full">
              <DataTable columns={columns} data={properties || []} />
            </ScrollArea>
          </div>

          {renderPagination()}

          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descarga
            </Button>
          </div>

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
