
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface InventorySearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  materialTypes: string[];
}

const InventorySearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterType, 
  onFilterChange, 
  materialTypes 
}: InventorySearchAndFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-8"
        />
      </div>
      <Select value={filterType || 'all'} onValueChange={onFilterChange}>
        <SelectTrigger className="w-40 h-8">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {materialTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type === 'all' ? 'All Types' : type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default InventorySearchAndFilters;
