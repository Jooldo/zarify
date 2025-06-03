
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import RawMaterialsHeader from './inventory/RawMaterialsHeader';
import RawMaterialsTable from './inventory/RawMaterialsTable';

interface RawMaterialInventoryProps {
  onRequestCreated?: () => void;
}

const RawMaterialInventory = ({ onRequestCreated }: RawMaterialInventoryProps) => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    
    let matchesStatus = true;
    if (filterStatus === 'Low Stock') {
      matchesStatus = material.current_stock <= material.minimum_stock;
    } else if (filterStatus === 'In Stock') {
      matchesStatus = material.current_stock > material.minimum_stock;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleMaterialAdded = () => {
    refetch();
  };

  const handleRequestCreated = () => {
    refetch();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  // Get unique material types for the filter
  const materialTypes = ['all', ...Array.from(new Set(rawMaterials.map(m => m.type)))];

  return (
    <div className="space-y-4">
      <RawMaterialsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        materialTypes={materialTypes}
        onMaterialAdded={handleMaterialAdded}
      />
      
      <RawMaterialsTable 
        materials={filteredMaterials} 
        loading={loading} 
        onUpdate={refetch}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
};

export default RawMaterialInventory;
