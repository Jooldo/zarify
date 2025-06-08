
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, AlertCircle, Edit, Eye } from 'lucide-react';
import AddMaterialDialog from '@/components/inventory/AddMaterialDialog';
import ViewRawMaterialDialog from '@/components/inventory/ViewRawMaterialDialog';
import UpdateRawMaterialDialog from '@/components/inventory/UpdateRawMaterialDialog';

const RawMaterialsConfig = () => {
  const { rawMaterials, loading, refetch, createRawMaterial } = useRawMaterials();
  const { materialTypes } = useMaterialTypes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false);
  const [isUpdateMaterialOpen, setIsUpdateMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleMaterialAdded = async () => {
    await refetch();
  };

  const handleViewMaterial = (material: any) => {
    setSelectedMaterial(material);
    setIsViewMaterialOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setSelectedMaterial(material);
    setIsUpdateMaterialOpen(true);
  };

  const handleMaterialUpdated = async () => {
    await refetch();
    setIsUpdateMaterialOpen(false);
  };

  // Get material types for the filter, including 'all'
  const filterOptions = [
    { value: 'all', label: 'All Types' },
    ...materialTypes.map(type => ({ value: type.name, label: type.name }))
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Raw Materials Configuration</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-lg">Loading raw materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search raw materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-3 text-xs border border-gray-300 rounded-md"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <AddMaterialDialog onAddMaterial={createRawMaterial} />
        </div>
      </div>

      {/* Raw Materials Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Type</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Unit</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Min Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id} className="h-10">
                <TableCell className="py-1 px-2 text-xs font-medium">
                  {material.name}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {material.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.minimum_stock}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewMaterial(material)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditMaterial(material)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Material Dialog */}
      <ViewRawMaterialDialog 
        material={selectedMaterial}
        isOpen={isViewMaterialOpen}
        onOpenChange={setIsViewMaterialOpen}
      />

      {/* Update Material Dialog */}
      <UpdateRawMaterialDialog 
        material={selectedMaterial}
        isOpen={isUpdateMaterialOpen}
        onOpenChange={setIsUpdateMaterialOpen}
        onMaterialUpdated={handleMaterialUpdated}
      />

      {/* Empty state */}
      {filteredMaterials.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {rawMaterials.length === 0 ? 'No raw materials found. Add some materials to get started.' : 'No materials found matching your search.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsConfig;
