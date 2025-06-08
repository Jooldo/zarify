
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

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
