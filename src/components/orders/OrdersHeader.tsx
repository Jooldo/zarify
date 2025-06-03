
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import CreateOrderForm from '@/components/CreateOrderForm';

interface OrdersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const OrdersHeader = ({ searchTerm, setSearchTerm }: OrdersHeaderProps) => {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-8"
        />
      </div>
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 h-8 px-3 text-xs">
            <Plus className="h-3 w-3" />
            Create Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <CreateOrderForm onClose={() => setIsCreateOrderOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersHeader;
