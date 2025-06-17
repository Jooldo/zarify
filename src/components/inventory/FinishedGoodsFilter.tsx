
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

interface FinishedGoodsFilterProps {
  onFiltersChange: (filters: any) => void;
  categories: string[];
  subcategories: string[];
}

const FinishedGoodsFilter = ({ onFiltersChange, categories, subcategories }: FinishedGoodsFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    size: '',
    stockLevel: '',
    tagEnabled: '',
    minStock: '',
    maxStock: '',
    hasThreshold: false,
    lowStock: false,
    inManufacturing: false
  });

  const sizeOptions = ['0.20m', '0.25m', '0.30m', '0.35m', '0.40m'];
  const stockLevelOptions = ['In Stock', 'Low Stock', 'Out of Stock'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.category) activeFilters.push({ key: 'category', label: 'Category', value: filters.category });
    if (filters.subcategory) activeFilters.push({ key: 'subcategory', label: 'Subcategory', value: filters.subcategory });
    if (filters.size) activeFilters.push({ key: 'size', label: 'Size', value: filters.size });
    if (filters.stockLevel) activeFilters.push({ key: 'stockLevel', label: 'Stock Level', value: filters.stockLevel });
    if (filters.tagEnabled) activeFilters.push({ key: 'tagEnabled', label: 'Tag Enabled', value: filters.tagEnabled });
    if (filters.minStock) activeFilters.push({ key: 'minStock', label: 'Min Stock', value: `≥${filters.minStock}` });
    if (filters.maxStock) activeFilters.push({ key: 'maxStock', label: 'Max Stock', value: `≤${filters.maxStock}` });
    if (filters.hasThreshold) activeFilters.push({ key: 'hasThreshold', label: 'Has Threshold', value: 'Yes' });
    if (filters.lowStock) activeFilters.push({ key: 'lowStock', label: 'Low Stock', value: 'Yes' });
    if (filters.inManufacturing) activeFilters.push({ key: 'inManufacturing', label: 'In Manufacturing', value: 'Yes' });
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
      size: '',
      stockLevel: '',
      tagEnabled: '',
      minStock: '',
      maxStock: '',
      hasThreshold: false,
      lowStock: false,
      inManufacturing: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasThreshold' || key === 'lowStock' || key === 'inManufacturing') {
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
        title="Filter Finished Goods"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
            <Select value={filters.subcategory || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, subcategory: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
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
            <Label>Size</Label>
            <Select value={filters.size || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, size: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {sizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stock Level</Label>
            <Select value={filters.stockLevel || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, stockLevel: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select stock level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {stockLevelOptions.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tag Enabled</Label>
            <Select value={filters.tagEnabled || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, tagEnabled: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select tag status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stock Range</Label>
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
                id="hasThreshold"
                checked={filters.hasThreshold}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasThreshold: !!checked }))}
              />
              <Label htmlFor="hasThreshold" className="text-sm">Has Threshold Set</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowStock"
                checked={filters.lowStock}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, lowStock: !!checked }))}
              />
              <Label htmlFor="lowStock" className="text-sm">Low Stock Items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inManufacturing"
                checked={filters.inManufacturing}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inManufacturing: !!checked }))}
              />
              <Label htmlFor="inManufacturing" className="text-sm">In Manufacturing</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default FinishedGoodsFilter;
