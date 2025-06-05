
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package } from 'lucide-react';
import AddMaterialDialog from './AddMaterialDialog';
import BulkRequestDialog from './BulkRequestDialog';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface RawMaterialsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  materialTypes: string[];
  onMaterialAdded: () => void;
  materials: RawMaterial[];
  onRequestCreated: () => void;
}

const RawMaterialsHeader = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  filterStatus,
  onFilterStatusChange,
  materialTypes,
  onMaterialAdded,
  materials,
  onRequestCreated
}: RawMaterialsHeaderProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkRequestDialogOpen, setIsBulkRequestDialogOpen] = useState(false);

  // Get materials that need procurement (have shortfall)
  const criticalMaterials = materials.filter(material => 
    Math.max(0, material.minimum_stock - material.current_stock) > 0
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Raw Materials</h3>
          <p className="text-sm text-gray-600">Manage your raw material inventory and procurement</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkRequestDialogOpen(true)}
            variant="outline"
            size="sm"
            disabled={criticalMaterials.length === 0}
          >
            <Package className="h-4 w-4 mr-2" />
            Bulk Request ({criticalMaterials.length})
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
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
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="High Shortfall">High Shortfall</SelectItem>
              <SelectItem value="Procurement Needed">Procurement Needed</SelectItem>
              <SelectItem value="High Requirement">High Requirement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AddMaterialDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onMaterialAdded={onMaterialAdded}
      />

      <BulkRequestDialog
        isOpen={isBulkRequestDialogOpen}
        onOpenChange={setIsBulkRequestDialogOpen}
        materials={criticalMaterials}
        onRequestsCreated={onRequestCreated}
      />
    </>
  );
};

export default RawMaterialsHeader;
