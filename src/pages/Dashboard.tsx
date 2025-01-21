import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ZipCodeFilter } from "@/components/dashboard/ZipCodeFilter";
import { ScoreFilter } from "@/components/dashboard/ScoreFilter";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PropertiesMap } from "@/components/dashboard/PropertiesMap";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";

export const Dashboard = () => {
  const {
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
  } = usePropertyFilters();

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-6">
        <div className="container mx-auto space-y-6">
          <h1 className="text-4xl font-inter font-semibold tracking-tight">Summary</h1>
          
          <SummaryCards />

          <h2 className="text-2xl font-semibold">Segmentación de Propiedades</h2>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Filtros de búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Códigos Postales</h3>
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
                  <h3 className="text-lg font-semibold mb-4">Scores</h3>
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
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
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