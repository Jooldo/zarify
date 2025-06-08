
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RawMaterialFiltersProps {
  filters: {
    type: string;
    status: string;
    stockLevel: string;
    supplier: string;
    shortfallRange: string;
  };
  onFiltersChange: (filters: any) => void;
  suppliers: string[];
}

const RawMaterialFilters = ({ filters, onFiltersChange, suppliers }: RawMaterialFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Chain', label: 'Chain' },
    { value: 'Kunda', label: 'Kunda' },
    { value: 'Ghungroo', label: 'Ghungroo' },
    { value: 'Thread', label: 'Thread' },
    { value: 'Beads', label: 'Beads' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'In Stock', label: 'In Stock' },
    { value: 'High Shortfall', label: 'High Shortfall' },
    { value: 'Procurement Needed', label: 'Procurement Needed' },
    { value: 'High Requirement', label: 'High Requirement' }
  ];

  const stockLevelOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'critical', label: 'Critical (≤ Min Stock)' },
    { value: 'low', label: 'Low (≤ 1.5x Min Stock)' },
    { value: 'normal', label: 'Normal (> 1.5x Min Stock)' }
  ];

  const shortfallRangeOptions = [
    { value: 'all', label: 'All Shortfall Ranges' },
    { value: 'none', label: 'No Shortfall' },
    { value: 'low', label: 'Low (1-10)' },
    { value: 'medium', label: 'Medium (11-50)' },
    { value: 'high', label: 'High (>50)' }
  ];

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      status: 'all',
      stockLevel: 'all',
      supplier: 'all',
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

        {/* Quick Type Filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {typeOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('type', option.value)}
              className="h-7 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
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
              <Label className="text-xs">Supplier</Label>
              <Select value={filters.supplier} onValueChange={(value) => updateFilter('supplier', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier} className="text-xs">
                      {supplier}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RawMaterialFilters;
