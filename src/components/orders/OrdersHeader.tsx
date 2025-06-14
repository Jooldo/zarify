import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog'; // Added DialogBody
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
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between py-4"> {/* Added py-4 for spacing */}
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9" // Adjusted height
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
          <Button className="flex items-center gap-2 h-9 px-3 text-xs"> {/* Adjusted height */}
            <Plus className="h-3.5 w-3.5" /> {/* Adjusted icon size */}
            Create Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle> {/* DialogTitle will use new theme */}
          </DialogHeader>
          <DialogBody className="overflow-y-auto"> {/* Using DialogBody for padding and scroll */}
            <CreateOrderForm 
              onClose={() => setIsCreateOrderOpen(false)} 
              onOrderCreated={() => {
                onOrderCreated();
                setIsCreateOrderOpen(false); // Close dialog on successful creation
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersHeader;
