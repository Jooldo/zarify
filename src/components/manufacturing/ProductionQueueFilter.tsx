
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

interface ProductionQueueFilterProps {
  onFiltersChange: (filters: any) => void;
}

const ProductionQueueFilter = ({ onFiltersChange }: ProductionQueueFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    productName: '',
    orderNumber: '',
    hasInProgressSteps: false,
    hasCompletedSteps: false,
    urgentOnly: false,
  });

  const statusOptions = ['pending', 'in_progress', 'completed'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.priority) activeFilters.push({ key: 'priority', label: 'Priority', value: filters.priority });
    if (filters.productName) activeFilters.push({ key: 'productName', label: 'Product Name', value: filters.productName });
    if (filters.orderNumber) activeFilters.push({ key: 'orderNumber', label: 'Order Number', value: filters.orderNumber });
    if (filters.hasInProgressSteps) activeFilters.push({ key: 'hasInProgressSteps', label: 'Has In Progress Steps', value: 'Yes' });
    if (filters.hasCompletedSteps) activeFilters.push({ key: 'hasCompletedSteps', label: 'Has Completed Steps', value: 'Yes' });
    if (filters.urgentOnly) activeFilters.push({ key: 'urgentOnly', label: 'Urgent Only', value: 'Yes' });
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
      orderNumber: '',
      hasInProgressSteps: false,
      hasCompletedSteps: false,
      urgentOnly: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasInProgressSteps' || key === 'hasCompletedSteps' || key === 'urgentOnly') {
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
        title="Filter Production Queue"
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

          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input
              type="text"
              placeholder="Search by product name"
              value={filters.productName}
              onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Order Number</Label>
            <Input
              type="text"
              placeholder="Search by order number"
              value={filters.orderNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, orderNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasInProgressSteps"
                checked={filters.hasInProgressSteps}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasInProgressSteps: !!checked }))}
              />
              <Label htmlFor="hasInProgressSteps" className="text-sm">Has In Progress Steps</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCompletedSteps"
                checked={filters.hasCompletedSteps}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasCompletedSteps: !!checked }))}
              />
              <Label htmlFor="hasCompletedSteps" className="text-sm">Has Completed Steps</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgentOnly"
                checked={filters.urgentOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, urgentOnly: !!checked }))}
              />
              <Label htmlFor="urgentOnly" className="text-sm">Urgent Priority Only</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default ProductionQueueFilter;
