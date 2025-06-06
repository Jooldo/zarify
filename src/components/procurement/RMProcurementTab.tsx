
import { useState } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, TrendingUp } from 'lucide-react';
import ProcurementRequestsTable from '../inventory/ProcurementRequestsTable';
import ViewRequestDialog from '../inventory/ViewRequestDialog';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

const RMProcurementTab = () => {
  const { requests, loading, updateRequestStatus, refetch } = useProcurementRequests();
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");

  const handleViewRequest = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus as 'Pending' | 'Approved' | 'Received');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Raw Material Procurement</h2>
        <p className="text-muted-foreground">
          Manage procurement requests, supplier relationships, and purchase orders for raw materials.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Procurement Requests
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Supplier Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Procurement Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Raw Material Procurement Requests</h3>
            {loading ? (
              <div className="text-center py-8">Loading procurement requests...</div>
            ) : (
              <ProcurementRequestsTable 
                requests={requests} 
                onViewRequest={handleViewRequest}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Supplier Management</h3>
            <p className="text-muted-foreground">
              Manage your raw material suppliers, contracts, and relationships.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                🚧 Supplier management features will be available soon. You can currently manage suppliers through the Raw Material Config section.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Procurement Analytics</h3>
            <p className="text-muted-foreground">
              View insights and analytics for raw material procurement performance.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 Procurement analytics dashboard coming soon. Track spending, delivery times, and supplier performance.
              </p>
            </div>
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

export default RMProcurementTab;
