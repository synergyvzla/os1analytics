
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface CityFilterProps {
  selectedCities: string[];
  availableCities: (string | null)[] | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleCitySelect: (city: string) => void;
  removeCity: (city: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

export const CityFilter = ({
  selectedCities,
  availableCities,
  searchQuery,
  setSearchQuery,
  handleCitySelect,
  removeCity,
  isDropdownOpen,
  setIsDropdownOpen,
}: CityFilterProps) => {
  const filteredCities = React.useMemo(() => {
    if (!availableCities) return [];
    return availableCities.filter(city => 
      city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCities, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCities.map((city) => (
          <Badge
            key={city}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            {city}
            <button
              onClick={() => removeCity(city)}
              className="ml-1 hover:bg-secondary-foreground/10 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>Seleccionar ciudades</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
        >
          <div className="p-2">
            <Input
              placeholder="Buscar ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[200px]">
            <DropdownMenuCheckboxItem
              checked={selectedCities.length === availableCities?.length}
              onCheckedChange={() => handleCitySelect('all')}
            >
              Seleccionar todas
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {filteredCities.map((city) => (
              city && (
                <DropdownMenuCheckboxItem
                  key={city}
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => handleCitySelect(city)}
                >
                  {city}
                </DropdownMenuCheckboxItem>
              )
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
