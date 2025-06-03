
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import InventoryHeader from './inventory/InventoryHeader';
import InventorySearchAndFilters from './inventory/InventorySearchAndFilters';
import RawMaterialsTable from './inventory/RawMaterialsTable';

interface RawMaterialInventoryProps {
  onRequestCreated?: () => void;
}

const RawMaterialInventory = ({ onRequestCreated }: RawMaterialInventoryProps) => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || material.type === filterType;
    
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

  return (
    <div className="space-y-4">
      <InventoryHeader 
        title="Raw Material Inventory"
        onMaterialAdded={handleMaterialAdded}
      />
      
      <InventorySearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        materials={rawMaterials}
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
