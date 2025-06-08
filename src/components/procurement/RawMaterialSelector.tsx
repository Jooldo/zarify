
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
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
  const selectedMaterial = rawMaterials.find(material => material.id === selectedMaterialId);

  const handleSelect = (materialId: string) => {
    console.log('RawMaterialSelector: Selecting material with ID:', materialId);
    onMaterialSelect(materialId);
    onOpenChange(false);
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
              {selectedMaterial
                ? `${selectedMaterial.name} (${selectedMaterial.type})`
                : "Select material..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search materials..." className="h-9" />
              <CommandList>
                <CommandEmpty>No materials found.</CommandEmpty>
                <CommandGroup>
                  {rawMaterials.map((material) => (
                    <CommandItem
                      key={material.id}
                      value={`${material.name} ${material.type}`}
                      onSelect={() => handleSelect(material.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMaterialId === material.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{material.name}</span>
                        <span className="text-sm text-gray-500">({material.type})</span>
                      </div>
                    </CommandItem>
                  ))}
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
