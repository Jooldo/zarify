
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface RawMaterialSelectorProps {
  rawMaterials: RawMaterial[];
  rawMaterialsLoading: boolean;
  selectedMaterialId: string;
  onMaterialSelect: (materialId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RawMaterialSelector = ({
  rawMaterials,
  rawMaterialsLoading,
  selectedMaterialId,
  onMaterialSelect,
  isOpen,
  onOpenChange
}: RawMaterialSelectorProps) => {
  console.log('RawMaterialSelector DEBUG:');
  console.log('- selectedMaterialId:', selectedMaterialId);
  console.log('- rawMaterials length:', rawMaterials.length);
  
  const selectedMaterial = rawMaterials.find(material => material.id === selectedMaterialId);
  console.log('- selectedMaterial found:', selectedMaterial);

  const handleSelect = (materialId: string) => {
    console.log('RawMaterialSelector: Selecting material with ID:', materialId);
    const materialToSelect = rawMaterials.find(m => m.id === materialId);
    console.log('RawMaterialSelector: Material being selected:', materialToSelect);
    onMaterialSelect(materialId);
    onOpenChange(false);
  };

  const getDisplayText = () => {
    if (selectedMaterial) {
      return `${selectedMaterial.name} (${selectedMaterial.type})`;
    }
    return "Select material...";
  };

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getInventoryStatus = (material: RawMaterial) => {
    const shortfall = (material.required_quantity || 0) + material.minimum_stock - material.current_stock - material.in_procurement;
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600' };
    } else if (material.current_stock <= material.minimum_stock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600' };
    }
  };

  return (
    <div>
      <Label>Raw Material *</Label>
      {rawMaterialsLoading ? (
        <div className="text-sm text-gray-500">Loading materials...</div>
      ) : (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              {getDisplayText()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search materials..." className="h-9" />
              <CommandList>
                <CommandEmpty>No materials found.</CommandEmpty>
                <CommandGroup>
                  {rawMaterials.map((material) => {
                    const statusInfo = getInventoryStatus(material);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <CommandItem
                        key={material.id}
                        value={`${material.name} ${material.type}`}
                        onSelect={() => handleSelect(material.id)}
                        className="p-3"
                      >
                        <Check
                          className={cn(
                            "mr-3 h-4 w-4",
                            selectedMaterialId === material.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{material.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({material.type})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                              <span className={`text-xs ${statusInfo.color}`}>
                                {statusInfo.status}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Stock:</span> {formatIndianNumber(material.current_stock)} {material.unit}
                            </div>
                            <div>
                              <span className="font-medium">Required:</span> {formatIndianNumber(material.required_quantity || 0)} {material.unit}
                            </div>
                            <div>
                              <span className="font-medium">In Proc:</span> {formatIndianNumber(material.in_procurement)} {material.unit}
                            </div>
                          </div>
                          {material.minimum_stock > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Min Stock:</span> {formatIndianNumber(material.minimum_stock)} {material.unit}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default RawMaterialSelector;
