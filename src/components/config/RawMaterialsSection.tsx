import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialsSectionProps {
  rawMaterials: Array<{
    material: string;
    quantity: number;
    unit: string;
  }>;
  addRawMaterial: () => void;
  removeRawMaterial: (index: number) => void;
  updateRawMaterial: (index: number, field: string, value: any) => void;
  updateRawMaterialBatch: (index: number, updates: { material?: string; unit?: string; quantity?: number }) => void;
}

interface RawMaterialSelectorProps {
  value: string;
  onChange: (materialId: string) => void;
  disabled?: boolean;
  availableRawMaterials: any[];
  loading: boolean;
}

const RawMaterialSelector = ({ value, onChange, disabled = false, availableRawMaterials, loading }: RawMaterialSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredMaterials = useMemo(() => {
    if (!searchTerm) return availableRawMaterials;
    
    const search = searchTerm.toLowerCase();
    return availableRawMaterials.filter(material => 
      material.name.toLowerCase().includes(search) ||
      material.type.toLowerCase().includes(search)
    );
  }, [availableRawMaterials, searchTerm]);

  const visibleMaterials = useMemo(() => 
    filteredMaterials.slice(0, visibleCount), 
    [filteredMaterials, visibleCount]
  );

  const selectedMaterial = availableRawMaterials.find(m => m.id === value);

  const handleSelect = (materialId: string) => {
    onChange(materialId);
    setIsOpen(false);
    setSearchTerm('');
    setVisibleCount(20);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, filteredMaterials.length));
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="w-full h-7 text-xs justify-between font-normal"
      >
        <span className="truncate text-left">
          {loading ? "Loading..." : (selectedMaterial ? `${selectedMaterial.name} (${selectedMaterial.type})` : "Select material")}
        </span>
        {isOpen ? <ChevronUp className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden shadow-lg border bg-white">
          <CardContent className="p-2">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(20);
                }}
                placeholder="Search materials..."
                className="h-6 text-xs pl-7"
                autoFocus
              />
            </div>

            <div className="max-h-40 overflow-y-auto">
              {visibleMaterials.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-500">
                  {loading ? 'Loading...' : 'No materials found'}
                </div>
              ) : (
                <>
                  {visibleMaterials.map((material) => (
                    <div
                      key={material.id}
                      onClick={() => handleSelect(material.id)}
                      className="p-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate flex-1">
                          {material.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {material.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {visibleCount < filteredMaterials.length && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={loadMore}
                      className="w-full h-6 text-xs mt-1"
                    >
                      Load More ({filteredMaterials.length - visibleCount} remaining)
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const RawMaterialsSection = ({ 
  rawMaterials, 
  addRawMaterial, 
  removeRawMaterial, 
  updateRawMaterial,
  updateRawMaterialBatch
}: RawMaterialsSectionProps) => {
  const { rawMaterials: availableRawMaterials, loading } = useRawMaterials();

  console.log('Available raw materials:', availableRawMaterials);
  console.log('Current raw materials state:', rawMaterials);

  const handleMaterialChange = (index: number, materialId: string) => {
    console.log('Material selection changed:', { index, materialId });
    const selectedMaterial = availableRawMaterials.find(m => m.id === materialId);
    console.log('Found selected material:', selectedMaterial);
    
    // Update both material and unit in a single batch update to avoid state conflicts
    if (selectedMaterial) {
      console.log('Updating material and unit together:', { materialId, unit: selectedMaterial.unit });
      updateRawMaterialBatch(index, {
        material: materialId,
        unit: selectedMaterial.unit
      });
    } else {
      updateRawMaterial(index, 'material', materialId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm flex items-center justify-between">
          Raw Materials Required
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRawMaterial}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rawMaterials.map((material, index) => {
          const selectedMaterial = availableRawMaterials.find(m => m.id === material.material);
          console.log(`Material ${index} state:`, { 
            materialId: material.material, 
            quantity: material.quantity, 
            unit: material.unit,
            selectedMaterial 
          });
          
          return (
            <div key={index} className="grid grid-cols-12 gap-1 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Raw Material</Label>
                <RawMaterialSelector
                  value={material.material || ""}
                  onChange={(value) => handleMaterialChange(index, value)}
                  disabled={loading}
                  availableRawMaterials={availableRawMaterials}
                  loading={loading}
                />
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={material.quantity || ""}
                  onChange={(e) => {
                    const newQuantity = parseFloat(e.target.value) || 0;
                    console.log('Quantity changed:', { index, newQuantity });
                    updateRawMaterial(index, 'quantity', newQuantity);
                  }}
                  placeholder="0"
                  className="h-7 text-xs"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={selectedMaterial?.unit || material.unit || ""}
                  className="h-7 text-xs bg-gray-50"
                  readOnly
                  placeholder="Unit"
                />
              </div>
              
              <div className="col-span-1">
                {rawMaterials.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRawMaterial(index)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RawMaterialsSection;
