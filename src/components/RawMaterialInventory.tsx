
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RawMaterialsHeader from './inventory/RawMaterialsHeader';
import RawMaterialsTable from './inventory/RawMaterialsTable';
import ProcurementRequestsTable from './inventory/ProcurementRequestsTable';
import ViewRequestDialog from './inventory/ViewRequestDialog';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface RawMaterialInventoryProps {
  onRequestCreated?: () => void;
}

const RawMaterialInventory = ({ onRequestCreated }: RawMaterialInventoryProps) => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const { requests, loading: requestsLoading, refetch: refetchRequests, updateRequestStatus } = useProcurementRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState("materials");
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

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
    refetchRequests();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  const handleViewRequest = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus as 'Pending' | 'Approved' | 'Received');
    refetchRequests();
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="procurement">Procurement Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="space-y-4 mt-4">
          <RawMaterialsHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={filterType}
            setTypeFilter={setFilterType}
            onRefresh={refetch}
          />
          
          <RawMaterialsTable 
            materials={filteredMaterials} 
            loading={loading} 
            onUpdate={refetch}
            onRequestCreated={handleRequestCreated}
          />
        </TabsContent>
        
        <TabsContent value="procurement" className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Procurement Requests</h3>
            {requestsLoading ? (
              <div className="text-center py-8">Loading procurement requests...</div>
            ) : (
              <ProcurementRequestsTable 
                requests={requests} 
                onViewRequest={handleViewRequest}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ViewRequestDialog
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        selectedRequest={selectedRequest}
        onUpdateRequestStatus={handleUpdateRequestStatus}
      />
    </div>
  );
};

export default RawMaterialInventory;
