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

interface ScoreFilterProps {
  selectedScores: string[];
  availableScores: (number | null)[] | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleScoreSelect: (score: string) => void;
  removeScore: (score: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

export const ScoreFilter = ({
  selectedScores,
  availableScores,
  searchQuery,
  setSearchQuery,
  handleScoreSelect,
  removeScore,
  isDropdownOpen,
  setIsDropdownOpen,
}: ScoreFilterProps) => {
  const filteredScores = React.useMemo(() => {
    if (!availableScores) return [];
    return availableScores.filter(score => 
      score?.toString().includes(searchQuery)
    );
  }, [availableScores, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedScores.map((score) => (
          <Badge
            key={score}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            Score {score}
            <button
              onClick={() => removeScore(score)}
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
            <span>Seleccionar scores</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
        >
          <div className="p-2">
            <Input
              placeholder="Buscar score..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[200px]">
            <DropdownMenuCheckboxItem
              checked={selectedScores.length === availableScores?.length}
              onCheckedChange={() => handleScoreSelect('all')}
            >
              Seleccionar todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {filteredScores.map((score) => (
              <DropdownMenuCheckboxItem
                key={score}
                checked={selectedScores.includes(score?.toString() || '')}
                onCheckedChange={() => handleScoreSelect(score?.toString() || '')}
              >
                Score {score}
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};