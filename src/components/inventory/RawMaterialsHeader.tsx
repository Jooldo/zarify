
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package2 } from 'lucide-react';

interface RawMaterialsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onRefresh: () => void;
}

const RawMaterialsHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  typeFilter, 
  setTypeFilter,
  onRefresh
}: RawMaterialsHeaderProps) => {
  const materialTypes = ["all", "Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package2 className="h-5 w-5" />
        Raw Materials Inventory
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search raw materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {materialTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

export default RawMaterialsHeader;
