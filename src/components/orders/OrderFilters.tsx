
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderFiltersProps {
  filters: {
    status: string;
    subStatus: string;
    stockStatus: string;
    customer: string;
    dateFrom: string;
    dateTo: string;
  };
  onFiltersChange: (filters: any) => void;
  customers: string[];
}

const OrderFilters = ({ filters, onFiltersChange, customers }: OrderFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Created', label: 'Created' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Ready', label: 'Ready' },
    { value: 'Delivered', label: 'Delivered' }
  ];

  const subStatusOptions = [
    { value: 'all', label: 'All Sub-Statuses' },
    { value: 'Created', label: 'Created' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Ready', label: 'Ready' },
    { value: 'Delivered', label: 'Delivered' }
  ];

  const stockStatusOptions = [
    { value: 'all', label: 'All Stock' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      subStatus: 'all',
      stockStatus: 'all',
      customer: 'all',
      dateFrom: '',
      dateTo: ''
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

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.status === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('status', option.value)}
              className="h-7 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t">
            <div>
              <Label className="text-xs">Sub-Status</Label>
              <Select value={filters.subStatus} onValueChange={(value) => updateFilter('subStatus', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Stock Status</Label>
              <Select value={filters.stockStatus} onValueChange={(value) => updateFilter('stockStatus', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stockStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Customer</Label>
              <Select value={filters.customer} onValueChange={(value) => updateFilter('customer', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer} className="text-xs">
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
