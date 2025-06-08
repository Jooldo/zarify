
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterDialog from '@/components/ui/filter-dialog';
import ActiveFiltersBar from '@/components/ui/active-filters-bar';

interface FinishedGoodsConfigFilterProps {
  onFiltersChange: (filters: any) => void;
  categories: string[];
  subcategories: string[];
}

const FinishedGoodsConfigFilter = ({ onFiltersChange, categories, subcategories }: FinishedGoodsConfigFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    sizeRange: '',
    status: '',
    hasThreshold: false,
    isActive: ''
  });

  const sizeRangeOptions = ['0.15-0.25m', '0.26-0.35m', '0.36-0.45m', '0.46m+'];
  const statusOptions = ['Active', 'Inactive'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.category) activeFilters.push({ key: 'category', label: 'Category', value: filters.category });
    if (filters.subcategory) activeFilters.push({ key: 'subcategory', label: 'Subcategory', value: filters.subcategory });
    if (filters.sizeRange) activeFilters.push({ key: 'sizeRange', label: 'Size Range', value: filters.sizeRange });
    if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.hasThreshold) activeFilters.push({ key: 'hasThreshold', label: 'Has Threshold', value: 'Yes' });
    if (filters.isActive) activeFilters.push({ key: 'isActive', label: 'Active Status', value: filters.isActive });
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      sizeRange: '',
      status: '',
      hasThreshold: false,
      isActive: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasThreshold') {
      newFilters[key] = false;
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <>
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

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Product Configurations"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select value={filters.subcategory} onValueChange={(value) => setFilters(prev => ({ ...prev, subcategory: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Size Range</Label>
            <Select value={filters.sizeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, sizeRange: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {sizeRangeOptions.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Active Status</Label>
            <Select value={filters.isActive} onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasThreshold"
                checked={filters.hasThreshold}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasThreshold: !!checked }))}
              />
              <Label htmlFor="hasThreshold" className="text-sm">Has Threshold Set</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default FinishedGoodsConfigFilter;
