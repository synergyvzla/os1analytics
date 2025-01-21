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

interface ZipCodeFilterProps {
  selectedZips: string[];
  availableZipCodes: (number | null)[] | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleZipSelect: (zip: string) => void;
  removeZip: (zip: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

export const ZipCodeFilter = ({
  selectedZips,
  availableZipCodes,
  searchQuery,
  setSearchQuery,
  handleZipSelect,
  removeZip,
  isDropdownOpen,
  setIsDropdownOpen,
}: ZipCodeFilterProps) => {
  const filteredZipCodes = React.useMemo(() => {
    if (!availableZipCodes) return [];
    return availableZipCodes.filter(zip => 
      zip?.toString().includes(searchQuery)
    );
  }, [availableZipCodes, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedZips.map((zip) => (
          <Badge
            key={zip}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            {zip}
            <button
              onClick={() => removeZip(zip)}
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
            <span>Seleccionar códigos postales</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
        >
          <div className="p-2">
            <Input
              placeholder="Buscar código postal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[200px]">
            <DropdownMenuCheckboxItem
              checked={selectedZips.length === availableZipCodes?.length}
              onCheckedChange={() => handleZipSelect('all')}
            >
              Seleccionar todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {filteredZipCodes.map((zip) => (
              <DropdownMenuCheckboxItem
                key={zip}
                checked={selectedZips.includes(zip?.toString() || '')}
                onCheckedChange={() => handleZipSelect(zip?.toString() || '')}
              >
                {zip}
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};