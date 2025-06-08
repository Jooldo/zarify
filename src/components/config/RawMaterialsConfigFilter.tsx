
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterDialog from '@/components/ui/filter-dialog';
import ActiveFiltersBar from '@/components/ui/active-filters-bar';

interface RawMaterialsConfigFilterProps {
  onFiltersChange: (filters: any) => void;
  materialTypes: string[];
}

const RawMaterialsConfigFilter = ({ onFiltersChange, materialTypes }: RawMaterialsConfigFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    unit: '',
    minStockRange: '',
    hasMinStock: false,
    noMinStock: false
  });

  const unitOptions = ['grams', 'pieces', 'meters', 'rolls', 'kg'];
  const minStockRangeOptions = ['0-10', '11-50', '51-100', '101-500', '500+'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.type) activeFilters.push({ key: 'type', label: 'Type', value: filters.type });
    if (filters.unit) activeFilters.push({ key: 'unit', label: 'Unit', value: filters.unit });
    if (filters.minStockRange) activeFilters.push({ key: 'minStockRange', label: 'Min Stock Range', value: filters.minStockRange });
    if (filters.hasMinStock) activeFilters.push({ key: 'hasMinStock', label: 'Has Min Stock', value: 'Yes' });
    if (filters.noMinStock) activeFilters.push({ key: 'noMinStock', label: 'No Min Stock', value: 'Yes' });
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      type: '',
      unit: '',
      minStockRange: '',
      hasMinStock: false,
      noMinStock: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasMinStock' || key === 'noMinStock') {
      newFilters[key] = false;
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(true)}
          className="h-8 px-3"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        <ActiveFiltersBar
          filters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearFilters}
        />
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Raw Materials Config"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={filters.unit} onValueChange={(value) => setFilters(prev => ({ ...prev, unit: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Minimum Stock Range</Label>
            <Select value={filters.minStockRange} onValueChange={(value) => setFilters(prev => ({ ...prev, minStockRange: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                {minStockRangeOptions.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasMinStock"
                checked={filters.hasMinStock}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasMinStock: !!checked }))}
              />
              <Label htmlFor="hasMinStock" className="text-sm">Has Minimum Stock Set</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noMinStock"
                checked={filters.noMinStock}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, noMinStock: !!checked }))}
              />
              <Label htmlFor="noMinStock" className="text-sm">No Minimum Stock Set</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default RawMaterialsConfigFilter;
