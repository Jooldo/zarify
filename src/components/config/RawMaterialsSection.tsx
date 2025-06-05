
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Minus, Check, ChevronsUpDown } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { cn } from '@/lib/utils';

interface RawMaterial {
  material: string;
  quantity: number;
  unit: string;
}

interface RawMaterialsSectionProps {
  rawMaterials: RawMaterial[];
  addRawMaterial: () => void;
  removeRawMaterial: (index: number) => void;
  updateRawMaterial: (index: number, field: string, value: any) => void;
}

const RawMaterialsSection = ({ 
  rawMaterials, 
  addRawMaterial, 
  removeRawMaterial, 
  updateRawMaterial 
}: RawMaterialsSectionProps) => {
  const { rawMaterials: availableRawMaterials, loading } = useRawMaterials();
  const [openComboboxes, setOpenComboboxes] = useState<{ [key: number]: boolean }>({});

  const setComboboxOpen = (index: number, open: boolean) => {
    setOpenComboboxes(prev => ({ ...prev, [index]: open }));
  };

  // Ensure availableRawMaterials is always an array and filter out any invalid entries
  const safeAvailableRawMaterials = (availableRawMaterials || []).filter(
    rawMat => rawMat && rawMat.id && rawMat.name && rawMat.type
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Raw Materials Required</CardTitle>
          <Button type="button" onClick={addRawMaterial} variant="outline" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Material
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rawMaterials.map((material, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 items-end">
            <div>
              <Label className="text-xs">Material</Label>
              <Popover open={openComboboxes[index]} onOpenChange={(open) => setComboboxOpen(index, open)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openComboboxes[index]}
                    className="h-8 w-full justify-between text-xs"
                    disabled={loading}
                  >
                    {material.material ? 
                      safeAvailableRawMaterials.find((rawMat) => rawMat.id === material.material)?.name || "Select material..."
                      : "Select material..."
                    }
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  {!loading && safeAvailableRawMaterials.length > 0 ? (
                    <Command>
                      <CommandInput placeholder="Search materials..." className="text-xs" />
                      <CommandEmpty className="text-xs">No material found.</CommandEmpty>
                      <CommandGroup>
                        {safeAvailableRawMaterials.map((rawMat) => (
                          <CommandItem
                            key={rawMat.id}
                            value={`${rawMat.name || ''} ${rawMat.type || ''}`}
                            onSelect={() => {
                              updateRawMaterial(index, 'material', rawMat.id);
                              setComboboxOpen(index, false);
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3",
                                material.material === rawMat.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {rawMat.name} ({rawMat.type})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  ) : (
                    <div className="p-4 text-xs text-center text-gray-500">
                      {loading ? "Loading materials..." : "No materials available"}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) => updateRawMaterial(index, 'quantity', Number(e.target.value))}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <Select 
                value={material.unit} 
                onValueChange={(value) => updateRawMaterial(index, 'unit', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grams" className="text-xs">Grams</SelectItem>
                  <SelectItem value="pieces" className="text-xs">Pieces</SelectItem>
                  <SelectItem value="meters" className="text-xs">Meters</SelectItem>
                  <SelectItem value="rolls" className="text-xs">Rolls</SelectItem>
                  <SelectItem value="kg" className="text-xs">Kilograms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRawMaterial(index)}
              disabled={rawMaterials.length === 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RawMaterialsSection;
