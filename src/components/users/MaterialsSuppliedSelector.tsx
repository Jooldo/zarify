
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialsSuppliedSelectorProps {
  selectedMaterialIds: string[];
  onMaterialIdsChange: (materialIds: string[]) => void;
  label?: string;
  placeholder?: string;
}

const MaterialsSuppliedSelector = ({
  selectedMaterialIds,
  onMaterialIdsChange,
  label = "Materials Supplied",
  placeholder = "Select materials..."
}: MaterialsSuppliedSelectorProps) => {
  const { rawMaterials, loading } = useRawMaterials();
  const [isOpen, setIsOpen] = useState(false);

  const handleMaterialToggle = (materialId: string) => {
    const updatedIds = selectedMaterialIds.includes(materialId)
      ? selectedMaterialIds.filter(id => id !== materialId)
      : [...selectedMaterialIds, materialId];
    
    onMaterialIdsChange(updatedIds);
  };

  const handleRemoveMaterial = (materialId: string) => {
    onMaterialIdsChange(selectedMaterialIds.filter(id => id !== materialId));
  };

  const getSelectedMaterials = () => {
    return rawMaterials.filter(material => selectedMaterialIds.includes(material.id));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="text-sm text-muted-foreground">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected materials display */}
      {selectedMaterialIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
          {getSelectedMaterials().map((material) => (
            <Badge key={material.id} variant="secondary" className="flex items-center gap-1">
              <span>{material.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemoveMaterial(material.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {selectedMaterialIds.length > 0 
              ? `${selectedMaterialIds.length} material${selectedMaterialIds.length > 1 ? 's' : ''} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search materials..." className="h-9" />
            <CommandList>
              <CommandEmpty>No materials found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {rawMaterials.map((material) => (
                    <CommandItem
                      key={material.id}
                      value={`${material.name} ${material.type}`}
                      onSelect={() => handleMaterialToggle(material.id)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedMaterialIds.includes(material.id)}
                        onChange={() => handleMaterialToggle(material.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.type} • {material.unit}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MaterialsSuppliedSelector;
