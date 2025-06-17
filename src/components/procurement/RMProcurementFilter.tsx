
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

interface RMProcurementFilterProps {
  onFiltersChange: (filters: any) => void;
  materialTypes: string[];
  suppliers: string[];
}

const RMProcurementFilter = ({ onFiltersChange, materialTypes, suppliers }: RMProcurementFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    materialType: '',
    supplier: '',
    raisedBy: '',
    dateFrom: '',
    dateTo: '',
    quantityMin: '',
    quantityMax: '',
    hasETA: false,
    isUrgent: false,
    pendingOnly: false
  });

  const statusOptions = ['Pending', 'Approved', 'Received', 'Cancelled'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.materialType) activeFilters.push({ key: 'materialType', label: 'Material Type', value: filters.materialType });
    if (filters.supplier) activeFilters.push({ key: 'supplier', label: 'Supplier', value: filters.supplier });
    if (filters.raisedBy) activeFilters.push({ key: 'raisedBy', label: 'Raised By', value: filters.raisedBy });
    if (filters.dateFrom) activeFilters.push({ key: 'dateFrom', label: 'From Date', value: filters.dateFrom });
    if (filters.dateTo) activeFilters.push({ key: 'dateTo', label: 'To Date', value: filters.dateTo });
    if (filters.quantityMin) activeFilters.push({ key: 'quantityMin', label: 'Min Qty', value: `≥${filters.quantityMin}` });
    if (filters.quantityMax) activeFilters.push({ key: 'quantityMax', label: 'Max Qty', value: `≤${filters.quantityMax}` });
    if (filters.hasETA) activeFilters.push({ key: 'hasETA', label: 'Has ETA', value: 'Yes' });
    if (filters.isUrgent) activeFilters.push({ key: 'isUrgent', label: 'Urgent', value: 'Yes' });
    if (filters.pendingOnly) activeFilters.push({ key: 'pendingOnly', label: 'Pending Only', value: 'Yes' });
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
      materialType: '',
      supplier: '',
      raisedBy: '',
      dateFrom: '',
      dateTo: '',
      quantityMin: '',
      quantityMax: '',
      hasETA: false,
      isUrgent: false,
      pendingOnly: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasETA' || key === 'isUrgent' || key === 'pendingOnly') {
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
        title="Filter Procurement Requests"
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
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={filters.materialType || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, materialType: value === 'all' ? '' : value }))}>
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
            <Label>Supplier</Label>
            <Select value={filters.supplier || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Raised By</Label>
            <Input
              placeholder="Enter name"
              value={filters.raisedBy}
              onChange={(e) => setFilters(prev => ({ ...prev, raisedBy: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantity Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.quantityMin}
                onChange={(e) => setFilters(prev => ({ ...prev, quantityMin: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.quantityMax}
                onChange={(e) => setFilters(prev => ({ ...prev, quantityMax: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasETA"
                checked={filters.hasETA}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasETA: !!checked }))}
              />
              <Label htmlFor="hasETA" className="text-sm">Has Expected Delivery Date</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isUrgent"
                checked={filters.isUrgent}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isUrgent: !!checked }))}
              />
              <Label htmlFor="isUrgent" className="text-sm">Urgent Requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pendingOnly"
                checked={filters.pendingOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, pendingOnly: !!checked }))}
              />
              <Label htmlFor="pendingOnly" className="text-sm">Pending Only</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default RMProcurementFilter;
