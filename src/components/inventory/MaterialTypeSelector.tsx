
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';

interface MaterialTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
}

const MaterialTypeSelector = ({ 
  value, 
  onValueChange, 
  placeholder = "Select material type...",
  required = false,
  label = "Material Type"
}: MaterialTypeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { materialTypes, loading, createMaterialType } = useMaterialTypes();

  const handleCreateNew = async () => {
    if (!newTypeName.trim()) return;
    
    setIsCreating(true);
    try {
      console.log('Creating new material type:', newTypeName.trim());
      const newType = await createMaterialType(newTypeName.trim());
      console.log('Material type created successfully:', newType);
      onValueChange(newTypeName.trim());
      setNewTypeName('');
      setShowAddNew(false);
      setOpen(false);
    } catch (error) {
      console.error('Error creating material type:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedType = materialTypes.find(type => type.name === value);

  return (
    <div>
      <Label htmlFor="materialType" className="text-sm font-medium">
        {label} {required && '*'}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 text-sm mt-2"
            disabled={loading}
          >
            {selectedType ? selectedType.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search material types..." />
            <CommandList>
              <CommandEmpty>
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">No material type found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAddNew(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add new type
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {materialTypes.map((type) => (
                  <CommandItem
                    key={type.id}
                    value={type.name}
                    onSelect={(currentValue) => {
                      console.log('Selecting material type:', currentValue);
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === type.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {type.name}
                  </CommandItem>
                ))}
                {materialTypes.length > 0 && (
                  <CommandItem onSelect={() => setShowAddNew(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add new type
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
          
          {showAddNew && (
            <div className="border-t p-3">
              <div className="space-y-2">
                <Input
                  placeholder="Enter new material type name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNew();
                    } else if (e.key === 'Escape') {
                      setShowAddNew(false);
                      setNewTypeName('');
                    }
                  }}
                  disabled={isCreating}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateNew}
                    disabled={!newTypeName.trim() || isCreating}
                  >
                    {isCreating ? 'Adding...' : 'Add'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddNew(false);
                      setNewTypeName('');
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MaterialTypeSelector;
