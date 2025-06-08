
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import RawMaterialsHeader from './inventory/RawMaterialsHeader';
import RawMaterialsTable from './inventory/RawMaterialsTable';
import SwiggyStyleFilters from './inventory/SwiggyStyleFilters';

interface RawMaterialInventoryProps {
  onRequestCreated?: () => void;
}

const RawMaterialInventory = ({ onRequestCreated }: RawMaterialInventoryProps) => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    stockLevel: 'all',
    supplier: 'all',
    shortfallRange: 'all'
  });

  // Get unique suppliers for filter options - extract company_name from supplier object
  const suppliers = [...new Set(rawMaterials
    .map(material => material.supplier?.company_name)
    .filter(Boolean)
  )] as string[];

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || material.type === filters.type;
    
    // Compare with supplier company_name
    const matchesSupplier = filters.supplier === 'all' || material.supplier?.company_name === filters.supplier;
    
    let matchesStatus = true;
    if (filters.status === 'Low Stock') {
      matchesStatus = material.current_stock <= material.minimum_stock;
    } else if (filters.status === 'In Stock') {
      matchesStatus = material.current_stock > material.minimum_stock;
    } else if (filters.status === 'High Shortfall') {
      matchesStatus = material.shortfall > 10;
    } else if (filters.status === 'Procurement Needed') {
      matchesStatus = material.shortfall > 0;
    } else if (filters.status === 'High Requirement') {
      matchesStatus = material.required_quantity > material.current_stock * 1.5;
    } else if (filters.status !== 'all') {
      matchesStatus = false;
    }

    let matchesStockLevel = true;
    if (filters.stockLevel === 'critical') {
      matchesStockLevel = material.current_stock <= material.minimum_stock;
    } else if (filters.stockLevel === 'low') {
      matchesStockLevel = material.current_stock <= material.minimum_stock * 1.5 && material.current_stock > material.minimum_stock;
    } else if (filters.stockLevel === 'normal') {
      matchesStockLevel = material.current_stock > material.minimum_stock * 1.5;
    }

    let matchesShortfallRange = true;
    if (filters.shortfallRange === 'none') {
      matchesShortfallRange = material.shortfall <= 0;
    } else if (filters.shortfallRange === 'low') {
      matchesShortfallRange = material.shortfall >= 1 && material.shortfall <= 10;
    } else if (filters.shortfallRange === 'medium') {
      matchesShortfallRange = material.shortfall >= 11 && material.shortfall <= 50;
    } else if (filters.shortfallRange === 'high') {
      matchesShortfallRange = material.shortfall > 50;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesStockLevel && matchesSupplier && matchesShortfallRange;
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
      
      <SwiggyStyleFilters
        filters={filters}
        onFiltersChange={setFilters}
        suppliers={suppliers}
        filterType="rawMaterials"
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
