
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, SortAsc } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  currentSort?: { field: string; direction: 'asc' | 'desc' } | null;
}

const SortDropdown = ({ options, onSortChange, currentSort }: SortDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <SortAsc className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <div key={option.value}>
            <DropdownMenuItem
              onClick={() => onSortChange(option.value, 'asc')}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              {option.label} (Low to High)
              {currentSort?.field === option.value && currentSort?.direction === 'asc' && (
                <span className="ml-auto text-xs text-blue-600">●</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(option.value, 'desc')}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              {option.label} (High to Low)
              {currentSort?.field === option.value && currentSort?.direction === 'desc' && (
                <span className="ml-auto text-xs text-blue-600">●</span>
              )}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
