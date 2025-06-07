
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrdersQuickFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  stockFilter: string;
  setStockFilter: (filter: string) => void;
}

const OrdersQuickFilters = ({ 
  statusFilter, 
  setStatusFilter, 
  stockFilter, 
  setStockFilter 
}: OrdersQuickFiltersProps) => {
  const statusOptions = ['All', 'Created', 'In Progress', 'Ready', 'Delivered'];
  const stockOptions = ['All', 'In Stock', 'Low Stock'];

  return (
    <div className="space-y-3">
      {/* Status Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <span className="text-sm font-medium text-gray-700 min-w-fit">Status:</span>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="h-7 text-xs"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Stock Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <span className="text-sm font-medium text-gray-700 min-w-fit">Stock:</span>
        <div className="flex flex-wrap gap-2">
          {stockOptions.map((filter) => (
            <Button
              key={filter}
              variant={stockFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter(filter)}
              className="h-7 text-xs"
            >
              {filter}
              {filter === 'Low Stock' && (
                <Badge variant="destructive" className="ml-1 h-4 text-xs">
                  !
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersQuickFilters;
