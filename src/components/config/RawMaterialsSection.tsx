
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Search, ChevronDown, ChevronUp, Package, Warehouse } from 'lucide-react';
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
  const [visibleCount, setVisibleCount] = useState(15);

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
    setVisibleCount(15);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 15, filteredMaterials.length));
  };

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' };
    if (currentStock <= minimumStock) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="w-full h-10 text-sm justify-between font-normal"
      >
        <span className="truncate text-left">
          {loading ? "Loading..." : (selectedMaterial ? `${selectedMaterial.name} (${selectedMaterial.type})` : "Select raw material")}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg border bg-white">
          <CardContent className="p-3 bg-white">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(15);
                }}
                placeholder="Search by material name or type..."
                className="h-9 text-sm pl-10 bg-white"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {visibleMaterials.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  {loading ? 'Loading materials...' : 'No materials found'}
                </div>
              ) : (
                <>
                  {visibleMaterials.map((material) => {
                    const stockStatus = getStockStatus(material.current_stock || 0, material.minimum_stock || 0);
                    
                    return (
                      <div
                        key={material.id}
                        onClick={() => handleSelect(material.id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border border-gray-100 rounded-md mb-2 transition-colors bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {material.name}
                              </div>
                              <Badge variant="outline" className="text-xs h-5 px-2 mt-1">
                                {material.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Warehouse className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">
                                {material.unit}
                              </span>
                            </div>
                            {material.cost_per_unit && (
                              <div className="text-xs text-gray-500">
                                ₹{material.cost_per_unit}/{material.unit}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Current Stock:</span>
                            <div className={`text-xs font-medium px-2 py-1 rounded ${stockStatus.bg} ${stockStatus.color}`}>
                              {material.current_stock || 0} {material.unit}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Min. Stock:</span>
                            <span className="text-xs text-gray-700">
                              {material.minimum_stock || 0} {material.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {visibleCount < filteredMaterials.length && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={loadMore}
                      className="w-full h-8 text-xs mt-2 bg-white hover:bg-gray-50"
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          Raw Materials Required
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRawMaterial}
            className="h-9 px-3 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {rawMaterials.map((material, index) => {
          const selectedMaterial = availableRawMaterials.find(m => m.id === material.material);
          console.log(`Material ${index} state:`, { 
            materialId: material.material, 
            quantity: material.quantity, 
            unit: material.unit,
            selectedMaterial 
          });
          
          return (
            <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="col-span-6">
                <Label className="text-sm font-medium">Raw Material *</Label>
                <RawMaterialSelector
                  value={material.material || ""}
                  onChange={(value) => handleMaterialChange(index, value)}
                  disabled={loading}
                  availableRawMaterials={availableRawMaterials}
                  loading={loading}
                />
              </div>
              
              <div className="col-span-2">
                <Label className="text-sm font-medium">Quantity *</Label>
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
                  className="h-10 text-sm"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <Label className="text-sm font-medium">Unit</Label>
                <Input
                  value={selectedMaterial?.unit || material.unit || ""}
                  className="h-10 text-sm bg-white"
                  readOnly
                  placeholder="Unit will be set automatically"
                />
              </div>
              
              <div className="col-span-1">
                {rawMaterials.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRawMaterial(index)}
                    className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
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
