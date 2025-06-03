
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import AddProductDialog from './AddProductDialog';
import { useState } from 'react';

interface InventoryHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sizeFilter: string;
  setSizeFilter: (size: string) => void;
  onProductAdded: () => void;
}

const InventoryHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter, 
  sizeFilter, 
  setSizeFilter,
  onProductAdded
}: InventoryHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const categories = ["all", "Traditional", "Modern", "Bridal"];
  const sizes = ["all", "0.20m", "0.25m", "0.30m", "0.35m", "0.40m"];

  const handleProductAdded = () => {
    onProductAdded();
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search finished goods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size === 'all' ? 'All Sizes' : size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 h-8 px-3 text-xs">
            <Plus className="h-3 w-3" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Finished Goods</DialogTitle>
          </DialogHeader>
          <AddProductDialog onProductAdded={handleProductAdded} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryHeader;
