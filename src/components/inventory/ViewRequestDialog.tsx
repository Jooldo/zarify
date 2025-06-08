
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Package, User, FileText, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers, type Supplier } from '@/hooks/useSuppliers';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ViewRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: ProcurementRequest | null;
  onUpdateRequestStatus: (requestId: string, newStatus: string) => Promise<void>;
  onRequestUpdated: () => void;
}

const ViewRequestDialog = ({ isOpen, onOpenChange, selectedRequest, onUpdateRequestStatus, onRequestUpdated }: ViewRequestDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  
  const { toast } = useToast();
  const { suppliers } = useSuppliers();

  // Initialize editedRequest when selectedRequest changes
  useEffect(() => {
    if (selectedRequest) {
      setEditedRequest({ ...selectedRequest });
    }
  }, [selectedRequest]);

  // Filter suppliers based on the material in the request
  useEffect(() => {
    if (selectedRequest && suppliers.length > 0) {
      const filtered = suppliers.filter(supplier => {
        // If materials_supplied is null, undefined, or empty, don't show the supplier
        if (!supplier.materials_supplied || supplier.materials_supplied.length === 0) {
          return false;
        }
        // Check if the material ID is in the supplier's materials_supplied array
        return supplier.materials_supplied.includes(selectedRequest.raw_material_id);
      });
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers([]);
    }
  }, [selectedRequest, suppliers]);

  if (!selectedRequest || !editedRequest) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveChanges = async () => {
    if (!editedRequest) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('procurement_requests')
        .update({
          quantity_requested: editedRequest.quantity_requested,
          supplier_id: editedRequest.supplier_id || null,
          eta: editedRequest.eta || null,
          notes: editedRequest.notes || null
        })
        .eq('id', editedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Procurement request updated successfully',
      });

      setIsEditing(false);
      onRequestUpdated();
    } catch (error) {
      console.error('Error updating procurement request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update procurement request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await onUpdateRequestStatus(selectedRequest.id, newStatus);
    onRequestUpdated();
  };

  const getSupplierName = (supplierId: string | undefined) => {
    if (!supplierId) return 'Not specified';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.company_name : 'Unknown Supplier';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procurement Request Details
            <Badge className={getStatusColor(selectedRequest.status)}>
              {selectedRequest.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Request Number</Label>
              <p className="mt-1 font-mono text-sm">{selectedRequest.request_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Date Requested</Label>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{new Date(selectedRequest.date_requested).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Material Information */}
          <div>
            <Label className="text-sm font-medium text-gray-500">Raw Material</Label>
            <div className="flex items-center gap-2 mt-1">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{selectedRequest.raw_material?.name} ({selectedRequest.raw_material?.type})</span>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity Requested</Label>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                <Input
                  id="quantity"
                  type="number"
                  value={editedRequest.quantity_requested}
                  onChange={(e) => setEditedRequest({
                    ...editedRequest,
                    quantity_requested: parseInt(e.target.value) || 0
                  })}
                  min="1"
                  className="flex-1"
                />
                <Input
                  value={selectedRequest.unit}
                  disabled
                  className="w-20 bg-gray-50"
                />
              </div>
            ) : (
              <p className="mt-1">{selectedRequest.quantity_requested} {selectedRequest.unit}</p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            {isEditing ? (
              <div className="mt-1">
                <Select 
                  value={editedRequest.supplier_id || ''} 
                  onValueChange={(value) => setEditedRequest({
                    ...editedRequest,
                    supplier_id: value || undefined
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      filteredSuppliers.length === 0 
                        ? "No suppliers configured for this material" 
                        : "Select supplier"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filteredSuppliers.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No suppliers have been configured to supply this material.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{getSupplierName(selectedRequest.supplier_id)}</span>
              </div>
            )}
          </div>

          {/* Expected Delivery */}
          <div>
            <Label htmlFor="eta">Expected Delivery Date</Label>
            {isEditing ? (
              <Input
                id="eta"
                type="date"
                value={editedRequest.eta || ''}
                onChange={(e) => setEditedRequest({
                  ...editedRequest,
                  eta: e.target.value || undefined
                })}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>{selectedRequest.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'}</span>
              </div>
            )}
          </div>

          {/* Raised By */}
          {selectedRequest.raised_by && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Raised By</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{selectedRequest.raised_by}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            {isEditing ? (
              <Textarea
                id="notes"
                value={editedRequest.notes || ''}
                onChange={(e) => setEditedRequest({
                  ...editedRequest,
                  notes: e.target.value
                })}
                rows={3}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {selectedRequest.notes || 'No notes provided'}
              </p>
            )}
          </div>

          {/* Status Update */}
          {!isEditing && selectedRequest.status !== 'Received' && (
            <div>
              <Label>Update Status</Label>
              <Select value={selectedRequest.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedRequest({ ...selectedRequest });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              selectedRequest.status === 'Pending' && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  Edit Request
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRequestDialog;
