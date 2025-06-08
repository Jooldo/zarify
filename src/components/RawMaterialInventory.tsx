
import { useState, useMemo } from 'react';
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

  // Calculate material stats
  const materialStats = useMemo(() => {
    const critical = rawMaterials.filter(material => {
      const shortfall = Math.max(0, material.required_quantity - (material.current_stock + material.in_procurement));
      return shortfall > 0;
    }).length;

    const low = rawMaterials.filter(material => {
      const shortfall = Math.max(0, material.required_quantity - (material.current_stock + material.in_procurement));
      return shortfall === 0 && material.current_stock <= material.minimum_stock;
    }).length;

    const good = rawMaterials.filter(material => {
      const shortfall = Math.max(0, material.required_quantity - (material.current_stock + material.in_procurement));
      return shortfall === 0 && material.current_stock > material.minimum_stock;
    }).length;

    return { critical, low, good };
  }, [rawMaterials]);

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
        materialStats={materialStats}
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
