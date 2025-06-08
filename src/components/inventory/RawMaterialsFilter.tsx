
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterDialog from '@/components/ui/filter-dialog';
import ActiveFiltersBar from '@/components/ui/active-filters-bar';

interface RawMaterialsFilterProps {
  onFiltersChange: (filters: any) => void;
  materialTypes: string[];
  suppliers: string[];
}

const RawMaterialsFilter = ({ onFiltersChange, materialTypes, suppliers }: RawMaterialsFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    unit: '',
    status: '',
    supplier: '',
    stockLevel: '',
    minStock: '',
    maxStock: '',
    hasCriticalStock: false,
    hasLowStock: false,
    hasShortfall: false
  });

  const statusOptions = ['Good', 'Low', 'Critical'];
  const unitOptions = ['grams', 'pieces', 'meters', 'rolls', 'kg'];
  const stockLevelOptions = ['Above Minimum', 'Below Minimum', 'Critical Level'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.type) activeFilters.push({ key: 'type', label: 'Type', value: filters.type });
    if (filters.unit) activeFilters.push({ key: 'unit', label: 'Unit', value: filters.unit });
    if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.supplier) activeFilters.push({ key: 'supplier', label: 'Supplier', value: filters.supplier });
    if (filters.stockLevel) activeFilters.push({ key: 'stockLevel', label: 'Stock Level', value: filters.stockLevel });
    if (filters.minStock) activeFilters.push({ key: 'minStock', label: 'Min Stock', value: `≥${filters.minStock}` });
    if (filters.maxStock) activeFilters.push({ key: 'maxStock', label: 'Max Stock', value: `≤${filters.maxStock}` });
    if (filters.hasCriticalStock) activeFilters.push({ key: 'hasCriticalStock', label: 'Critical Stock', value: 'Yes' });
    if (filters.hasLowStock) activeFilters.push({ key: 'hasLowStock', label: 'Low Stock', value: 'Yes' });
    if (filters.hasShortfall) activeFilters.push({ key: 'hasShortfall', label: 'Has Shortfall', value: 'Yes' });
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
      status: '',
      supplier: '',
      stockLevel: '',
      minStock: '',
      maxStock: '',
      hasCriticalStock: false,
      hasLowStock: false,
      hasShortfall: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasCriticalStock' || key === 'hasLowStock' || key === 'hasShortfall') {
      newFilters[key] = false;
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <>
      <div className="flex items-center gap-2">
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
      </div>

      <ActiveFiltersBar
        filters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearFilters}
        totalResults={0}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Raw Materials"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={filters.unit} onValueChange={(value) => setFilters(prev => ({ ...prev, unit: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Units</SelectItem>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={filters.supplier} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stock Level</Label>
            <Select value={filters.stockLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, stockLevel: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select stock level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {stockLevelOptions.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Min Stock Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minStock}
                onChange={(e) => setFilters(prev => ({ ...prev, minStock: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxStock}
                onChange={(e) => setFilters(prev => ({ ...prev, maxStock: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="critical"
                checked={filters.hasCriticalStock}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasCriticalStock: !!checked }))}
              />
              <Label htmlFor="critical" className="text-sm">Critical Stock Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="low"
                checked={filters.hasLowStock}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasLowStock: !!checked }))}
              />
              <Label htmlFor="low" className="text-sm">Low Stock Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shortfall"
                checked={filters.hasShortfall}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasShortfall: !!checked }))}
              />
              <Label htmlFor="shortfall" className="text-sm">Has Shortfall</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default RawMaterialsFilter;
