
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface ActiveFiltersBarProps {
  filters: ActiveFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  totalResults?: number;
}

const ActiveFiltersBar = ({ filters, onRemoveFilter, onClearAll, totalResults }: ActiveFiltersBarProps) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Active filters:</span>
        {filters.map((filter) => (
          <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
            {filter.label}: {filter.value}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemoveFilter(filter.key)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
          Clear All
        </Button>
      </div>
      {totalResults !== undefined && (
        <span className="text-sm text-gray-600">{totalResults} results</span>
      )}
    </div>
  );
};

export default ActiveFiltersBar;
