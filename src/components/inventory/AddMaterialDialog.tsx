
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const AddMaterialDialog = () => {
  const materialTypes = ["Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  return (
    <Dialog>
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="materialName">Material Name</Label>
            <Input id="materialName" placeholder="Enter material name" />
          </div>
          <div>
            <Label htmlFor="materialType">Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input id="currentStock" type="number" placeholder="0" />
            </div>
            <div>
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input id="minStock" type="number" placeholder="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="rolls">Rolls</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Add Material</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialDialog;
