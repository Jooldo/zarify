
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
    } else if (filterStatus === 'High Shortfall') {
      matchesStatus = material.shortfall > 10;
    } else if (filterStatus === 'Procurement Needed') {
      matchesStatus = material.shortfall > 0;
    } else if (filterStatus === 'High Requirement') {
      matchesStatus = material.required_quantity > material.current_stock * 1.5;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRequestCreated = () => {
    refetch();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  return (
    <div className="space-y-4">
      <RawMaterialsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={filterType}
        setTypeFilter={setFilterType}
        statusFilter={filterStatus}
        setStatusFilter={setFilterStatus}
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
