
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

interface OrdersFilterProps {
  onFiltersChange: (filters: any) => void;
  customers: string[];
  categories: string[];
  subcategories: string[];
}

const OrdersFilter = ({ onFiltersChange, customers, categories, subcategories }: OrdersFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    customer: '',
    orderStatus: '',
    suborderStatus: '',
    category: '',
    subcategory: '',
    dateRange: '',
    deliveryDateRange: '',
    minAmount: '',
    maxAmount: '',
    hasDeliveryDate: false,
    overdueDelivery: false,
    lowStock: false,
    stockAvailable: false
  });

  const orderStatusOptions = ['Created', 'In Progress', 'Ready', 'Delivered'];
  const suborderStatusOptions = ['Created', 'In Progress', 'Ready', 'Delivered'];
  const dateRangeOptions = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];
  const deliveryDateRangeOptions = ['Due Today', 'Due This Week', 'Due This Month', 'Overdue'];

  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.customer) activeFilters.push({ key: 'customer', label: 'Customer', value: filters.customer });
    if (filters.orderStatus) activeFilters.push({ key: 'orderStatus', label: 'Order Status', value: filters.orderStatus });
    if (filters.suborderStatus) activeFilters.push({ key: 'suborderStatus', label: 'Suborder Status', value: filters.suborderStatus });
    if (filters.category) activeFilters.push({ key: 'category', label: 'Category', value: filters.category });
    if (filters.subcategory) activeFilters.push({ key: 'subcategory', label: 'Subcategory', value: filters.subcategory });
    if (filters.dateRange) activeFilters.push({ key: 'dateRange', label: 'Date Range', value: filters.dateRange });
    if (filters.deliveryDateRange) activeFilters.push({ key: 'deliveryDateRange', label: 'Delivery Date', value: filters.deliveryDateRange });
    if (filters.minAmount) activeFilters.push({ key: 'minAmount', label: 'Min Amount', value: `≥₹${filters.minAmount}` });
    if (filters.maxAmount) activeFilters.push({ key: 'maxAmount', label: 'Max Amount', value: `≤₹${filters.maxAmount}` });
    if (filters.hasDeliveryDate) activeFilters.push({ key: 'hasDeliveryDate', label: 'Has Delivery Date', value: 'Yes' });
    if (filters.overdueDelivery) activeFilters.push({ key: 'overdueDelivery', label: 'Overdue Delivery', value: 'Yes' });
    if (filters.lowStock) activeFilters.push({ key: 'lowStock', label: 'Low Stock Items', value: 'Yes' });
    if (filters.stockAvailable) activeFilters.push({ key: 'stockAvailable', label: 'Stock Available', value: 'Yes' });
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      customer: '',
      orderStatus: '',
      suborderStatus: '',
      category: '',
      subcategory: '',
      dateRange: '',
      deliveryDateRange: '',
      minAmount: '',
      maxAmount: '',
      hasDeliveryDate: false,
      overdueDelivery: false,
      lowStock: false,
      stockAvailable: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'hasDeliveryDate' || key === 'overdueDelivery' || key === 'lowStock' || key === 'stockAvailable') {
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
        title="Filter Orders"
        activeFilterCount={activeFilters.length}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={filters.customer} onValueChange={(value) => setFilters(prev => ({ ...prev, customer: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Order Status</Label>
            <Select value={filters.orderStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, orderStatus: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Suborder Status</Label>
            <Select value={filters.suborderStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, suborderStatus: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {suborderStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label>Order Date Range</Label>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value === 'all' ? '' : value }))}>
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

          <div className="space-y-2">
            <Label>Expected Delivery Date</Label>
            <Select value={filters.deliveryDateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, deliveryDateRange: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All delivery dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery Dates</SelectItem>
                {deliveryDateRangeOptions.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Order Amount Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min amount"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDeliveryDate"
                checked={filters.hasDeliveryDate}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasDeliveryDate: !!checked }))}
              />
              <Label htmlFor="hasDeliveryDate" className="text-sm">Has Delivery Date</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdueDelivery"
                checked={filters.overdueDelivery}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, overdueDelivery: !!checked }))}
              />
              <Label htmlFor="overdueDelivery" className="text-sm">Overdue Delivery</Label>
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
                id="stockAvailable"
                checked={filters.stockAvailable}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, stockAvailable: !!checked }))}
              />
              <Label htmlFor="stockAvailable" className="text-sm">Stock Available</Label>
            </div>
          </div>
        </div>
      </FilterDialog>
    </>
  );
};

export default OrdersFilter;
