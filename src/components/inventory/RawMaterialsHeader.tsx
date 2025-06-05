
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import AddMaterialDialog from './AddMaterialDialog';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  materialTypes: string[];
  onMaterialAdded: () => void;
}

const RawMaterialsHeader = ({ 
  searchTerm, 
  onSearchChange, 
  filterType, 
  onFilterChange,
  filterStatus,
  onFilterStatusChange,
  materialTypes,
  onMaterialAdded
}: RawMaterialsHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createRawMaterial } = useRawMaterials();

  const statusOptions = ['All', 'Low Stock', 'In Stock'];

  const handleMaterialAdded = async (materialData: any) => {
    try {
      await createRawMaterial(materialData);
      onMaterialAdded();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
        <Select value={filterType} onValueChange={onFilterChange}>
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
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 h-8 px-3 text-xs">
            <Plus className="h-3 w-3" />
            Add Material
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Raw Material</DialogTitle>
          </DialogHeader>
          <AddMaterialDialog onAddMaterial={handleMaterialAdded} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RawMaterialsHeader;
