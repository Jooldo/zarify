
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import ManufacturingOrdersFilter from './ManufacturingOrdersFilter';
import { ManufacturingFilters } from '@/types/manufacturing';

interface ManufacturingToolbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onFiltersChange: (filters: ManufacturingFilters) => void;
}

const ManufacturingToolbar = ({ searchTerm, onSearchTermChange, onFiltersChange }: ManufacturingToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search manufacturing orders..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <ManufacturingOrdersFilter onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
};

export default ManufacturingToolbar;
