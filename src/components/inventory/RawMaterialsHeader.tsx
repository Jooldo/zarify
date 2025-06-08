
import { Input } from '@/components/ui/input';
import { Search, Package2 } from 'lucide-react';

interface RawMaterialsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const RawMaterialsHeader = ({ 
  searchTerm, 
  setSearchTerm
}: RawMaterialsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package2 className="h-5 w-5" />
        Raw Materials Inventory
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search raw materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </div>
    </div>
  );
};

export default RawMaterialsHeader;
