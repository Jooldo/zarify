
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import FilterDialog from '@/components/ui/filter-dialog';
import ActiveFiltersBar from '@/components/ui/active-filters-bar';

interface ManufacturingOrdersFilterProps {
  onFiltersChange: (filters: any) => void;
}

const ManufacturingOrdersFilter = ({ onFiltersChange }: ManufacturingOrdersFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    productName: '',
    dueDateFrom: null as Date | null,
    dueDateTo: null as Date | null,
    createdDateRange: '',
    hasSpecialInstructions: false,
    overdueOrders: false,
  });

  const statusOptions = ['pending', 'in_progress', 'completed'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const dateRangeOptions = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.priority) activeFilters.push({ key: 'priority', label: 'Priority', value: filters.priority });
    if (filters.productName) activeFilters.push({ key: 'productName', label: 'Product Name', value: filters.productName });
    if (filters.createdDateRange) activeFilters.push({ key: 'createdDateRange', label: 'Created Date', value: filters.createdDateRange });
    if (filters.dueDateFrom) activeFilters.push({ key: 'dueDateFrom', label: 'Due From', value: format(filters.dueDateFrom, 'MMM dd, yyyy') });
    if (filters.dueDateTo) activeFilters.push({ key: 'dueDateTo', label: 'Due To', value: format(filters.dueDateTo, 'MMM dd, yyyy') });
    if (filters.hasSpecialInstructions) activeFilters.push({ key: 'hasSpecialInstructions', label: 'Has Special Instructions', value: 'Yes' });
    if (filters.overdueOrders) activeFilters.push({ key: 'overdueOrders', label: 'Overdue Orders', value: 'Yes' });
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: '',
      priority: '',
      productName: '',
      dueDateFrom: null as Date | null,
      dueDateTo: null as Date | null,
      createdDateRange: '',
      hasSpecialInstructions: false,
      overdueOrders: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasSpecialInstructions' || key === 'overdueOrders') {
      newFilters[key] = false;
    } else if (key === 'dueDateFrom' || key === 'dueDateTo') {
      newFilters[key] = null;
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
        title="Filter Manufacturing Orders"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={filters.priority || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Product Name</Label>
            <Input
              type="text"
              placeholder="Search by product name"
              value={filters.productName}
              onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Created Date Range</Label>
            <Select value={filters.createdDateRange || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, createdDateRange: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                {dateRangeOptions.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Due Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dueDateFrom ? format(filters.dueDateFrom, 'MMM dd, yyyy') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dueDateFrom || undefined}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dueDateFrom: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dueDateTo ? format(filters.dueDateTo, 'MMM dd, yyyy') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dueDateTo || undefined}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dueDateTo: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSpecialInstructions"
                checked={filters.hasSpecialInstructions}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasSpecialInstructions: !!checked }))}
              />
              <Label htmlFor="hasSpecialInstructions" className="text-sm">Has Special Instructions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdueOrders"
                checked={filters.overdueOrders}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, overdueOrders: !!checked }))}
              />
              <Label htmlFor="overdueOrders" className="text-sm">Overdue Orders</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default ManufacturingOrdersFilter;
