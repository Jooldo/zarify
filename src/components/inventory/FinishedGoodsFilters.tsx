
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FinishedGoodsFiltersProps {
  filters: {
    category: string;
    status: string;
    stockLevel: string;
    sizeRange: string;
    shortfallRange: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: string[];
}

const FinishedGoodsFilters = ({ filters, onFiltersChange, categories }: FinishedGoodsFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Low', label: 'Low Stock' },
    { value: 'Good', label: 'Good Stock' },
    { value: 'Procurement Needed', label: 'Procurement Needed' }
  ];

  const stockLevelOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'critical', label: 'Critical (≤ Threshold)' },
    { value: 'low', label: 'Low (≤ 1.5x Threshold)' },
    { value: 'normal', label: 'Normal (> 1.5x Threshold)' }
  ];

  const sizeRangeOptions = [
    { value: 'all', label: 'All Sizes' },
    { value: 'small', label: 'Small (≤ 12")' },
    { value: 'medium', label: 'Medium (13-18")' },
    { value: 'large', label: 'Large (> 18")' }
  ];

  const shortfallRangeOptions = [
    { value: 'all', label: 'All Shortfall Ranges' },
    { value: 'surplus', label: 'Surplus' },
    { value: 'low', label: 'Low Shortfall (1-50)' },
    { value: 'medium', label: 'Medium Shortfall (51-200)' },
    { value: 'high', label: 'High Shortfall (>200)' }
  ];

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      status: 'all',
      stockLevel: 'all',
      sizeRange: 'all',
      shortfallRange: 'all'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'all' && value !== ''
  ).length;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            <span className="font-medium text-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs"
            >
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categoryOptions.slice(0, 6).map((option) => (
            <Button
              key={option.value}
              variant={filters.category === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('category', option.value)}
              className="h-7 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Stock Level</Label>
              <Select value={filters.stockLevel} onValueChange={(value) => updateFilter('stockLevel', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stockLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Size Range</Label>
              <Select value={filters.sizeRange} onValueChange={(value) => updateFilter('sizeRange', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Shortfall Range</Label>
              <Select value={filters.shortfallRange} onValueChange={(value) => updateFilter('shortfallRange', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shortfallRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Category</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinishedGoodsFilters;
