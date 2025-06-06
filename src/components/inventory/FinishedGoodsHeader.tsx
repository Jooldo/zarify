
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';

interface FinishedGoodsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const FinishedGoodsHeader = ({
  searchTerm,
  onSearchChange,
  onRefresh
}: FinishedGoodsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5" />
        Finished Goods Inventory
      </h3>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="h-8"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default FinishedGoodsHeader;
