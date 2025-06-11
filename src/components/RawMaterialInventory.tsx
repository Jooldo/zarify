import { useState, useMemo } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import RawMaterialsHeader from './inventory/RawMaterialsHeader';
import RawMaterialsTable from './inventory/RawMaterialsTable';
import RawMaterialsFilter from './inventory/RawMaterialsFilter';
import SortDropdown from './ui/sort-dropdown';

interface RawMaterialInventoryProps {
  onRequestCreated?: () => void;
}

const RawMaterialInventory = ({ onRequestCreated }: RawMaterialInventoryProps) => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  const sortOptions = [
    { value: 'ordered_qty', label: 'Quantity Required based on Finished Good Shortfall' },
    { value: 'current_stock', label: 'Current Stock' },
    { value: 'in_procurement', label: 'In Procurement' },
    { value: 'shortfall', label: 'Shortfall' }
  ];

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
  };

  const applyFilters = (materials: any[], appliedFilters: any) => {
    return materials.filter(material => {
      // Search term filter
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filter
      if (appliedFilters.type && material.type !== appliedFilters.type) return false;
      
      // Unit filter
      if (appliedFilters.unit && material.unit !== appliedFilters.unit) return false;
      
      // Status filter
      if (appliedFilters.status) {
        const shortfall = material.shortfall;
        let status = 'Good';
        if (shortfall > 0) status = 'Critical';
        else if (material.current_stock <= material.minimum_stock) status = 'Low';
        
        if (status !== appliedFilters.status) return false;
      }
      
      // Supplier filter (if material has supplier)
      if (appliedFilters.supplier && material.supplier_name !== appliedFilters.supplier) return false;
      
      // Stock level filter
      if (appliedFilters.stockLevel) {
        if (appliedFilters.stockLevel === 'Above Minimum' && material.current_stock <= material.minimum_stock) return false;
        if (appliedFilters.stockLevel === 'Below Minimum' && material.current_stock > material.minimum_stock) return false;
        if (appliedFilters.stockLevel === 'Critical Level' && material.current_stock > material.minimum_stock * 0.5) return false;
      }
      
      // Stock range filters
      if (appliedFilters.minStock && material.current_stock < parseInt(appliedFilters.minStock)) return false;
      if (appliedFilters.maxStock && material.current_stock > parseInt(appliedFilters.maxStock)) return false;
      
      // Quick filters
      if (appliedFilters.hasCriticalStock && material.shortfall <= 0) return false;
      if (appliedFilters.hasLowStock && material.current_stock > material.minimum_stock) return false;
      if (appliedFilters.hasShortfall && material.shortfall <= 0) return false;
      
      return true;
    });
  };

  const filteredMaterials = applyFilters(rawMaterials, filters);

  // Calculate material stats
  const materialStats = useMemo(() => {
    const critical = rawMaterials.filter(material => material.shortfall > 0).length;
    const low = rawMaterials.filter(material => 
      material.shortfall === 0 && material.current_stock <= material.minimum_stock
    ).length;
    const good = rawMaterials.filter(material => 
      material.shortfall === 0 && material.current_stock > material.minimum_stock
    ).length;
    const total = rawMaterials.length;

    return { total, critical, low, good };
  }, [rawMaterials]);

  const handleRequestCreated = () => {
    refetch();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  const materialTypes = [...new Set(rawMaterials.map(material => material.type))].filter(Boolean);
  const supplierNames = [...new Set(suppliers.map(supplier => supplier.company_name))].filter(Boolean);

  const handleViewMaterial = (material: any) => {
    // Add view material logic here if needed
    console.log('View material:', material);
  };

  const handleEditMaterial = (material: any) => {
    // Add edit material logic here if needed
    console.log('Edit material:', material);
  };

  return (
    <div className="space-y-4">
      <RawMaterialsHeader
        materialStats={materialStats}
      />
      
      <div className="flex items-start gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search raw materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <RawMaterialsFilter
          onFiltersChange={setFilters}
          materialTypes={materialTypes}
          suppliers={supplierNames}
        />
        <SortDropdown
          options={sortOptions}
          onSortChange={handleSortChange}
          currentSort={sortConfig}
        />
      </div>
      
      <RawMaterialsTable 
        rawMaterials={filteredMaterials}
        onViewMaterial={handleViewMaterial}
        onEditMaterial={handleEditMaterial}
      />
    </div>
  );
};

export default RawMaterialInventory;
