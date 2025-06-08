
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import CreateOrderForm from '@/components/CreateOrderForm';
import OrdersFilter from './OrdersFilter';

interface OrdersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOrderCreated: () => void;
  onFiltersChange: (filters: any) => void;
  customers: string[];
  categories: string[];
  subcategories: string[];
}

const OrdersHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  onOrderCreated, 
  onFiltersChange,
  customers,
  categories,
  subcategories
}: OrdersHeaderProps) => {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <OrdersFilter
          onFiltersChange={onFiltersChange}
          customers={customers}
          categories={categories}
          subcategories={subcategories}
        />
      </div>
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 h-8 px-3 text-xs">
            <Plus className="h-3 w-3" />
            Create Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Create New Order</DialogTitle>
          </DialogHeader>
          <CreateOrderForm 
            onClose={() => setIsCreateOrderOpen(false)} 
            onOrderCreated={onOrderCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersHeader;
