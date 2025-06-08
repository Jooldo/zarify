import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Package, User, FileText, Building2, Hash, ShoppingCart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers, type Supplier } from '@/hooks/useSuppliers';
import SendWhatsAppDialog from '@/components/procurement/SendWhatsAppDialog';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ViewRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: ProcurementRequest | null;
  onUpdateRequestStatus: (requestId: string, newStatus: string) => Promise<void>;
  onRequestUpdated: () => void;
}

interface MultiItemMaterial {
  name: string;
  type: string;
  quantity: number;
  unit: string;
  notes?: string;
}

const ViewRequestDialog = ({ isOpen, onOpenChange, selectedRequest, onUpdateRequestStatus, onRequestUpdated }: ViewRequestDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  
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
        if (!supplier.materials_supplied || supplier.materials_supplied.length === 0) {
          return false;
        }
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

  const getRequestOrigin = (notes?: string) => {
    if (!notes) return 'procurement';
    if (notes.includes('Source: Inventory Alert')) return 'inventory';
    if (notes.includes('Source: Multi-Item Procurement Request')) return 'multi-item';
    return 'procurement';
  };

  const parseMultiItemMaterials = (notes?: string): MultiItemMaterial[] => {
    if (!notes || !notes.includes('Materials in this request:')) return [];
    
    const materialsSection = notes.split('Materials in this request:')[1];
    if (!materialsSection) return [];

    const materialLines = materialsSection.trim().split('\n').filter(line => line.trim());
    
    const materials: MultiItemMaterial[] = [];
    for (const line of materialLines) {
      // Parse format: "1. Material Name (Type) - Quantity Unit - Notes"
      const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\)\s*-\s*(\d+)\s*(\w+)(?:\s*-\s*(.+))?$/);
      if (match) {
        materials.push({
          name: match[1].trim(),
          type: match[2].trim(),
          quantity: parseInt(match[3]),
          unit: match[4].trim(),
          notes: match[5]?.trim() || ''
        });
      }
    }
    return materials;
  };

  const requestOrigin = getRequestOrigin(selectedRequest.notes);
  const isMultiItem = requestOrigin === 'multi-item';
  const multiItemMaterials = isMultiItem ? parseMultiItemMaterials(selectedRequest.notes) : [];

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

  const getTotalQuantity = () => {
    if (isMultiItem && multiItemMaterials.length > 0) {
      return multiItemMaterials.reduce((total, material) => total + material.quantity, 0);
    }
    return selectedRequest.quantity_requested;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Procurement Request Details
              <Badge className={getStatusColor(selectedRequest.status)}>
                {selectedRequest.status}
              </Badge>
              {isMultiItem && (
                <Badge variant="default" className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Multi-Item
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Section - Request Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Request Number</p>
                  <p className="font-mono text-sm font-medium">{selectedRequest.request_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Date Requested</p>
                  <p className="text-sm">{new Date(selectedRequest.date_requested).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedRequest.raised_by && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Raised By</p>
                    <p className="text-sm">{selectedRequest.raised_by}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Total Quantity</p>
                  <p className="text-sm font-medium">{getTotalQuantity()} {selectedRequest.unit}</p>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                {isMultiItem ? 'Materials in Request' : 'Raw Material'}
              </Label>
              
              {isMultiItem ? (
                <div className="space-y-3">
                  {multiItemMaterials.map((material, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-gray-600">Type: {material.type}</p>
                          <p className="text-sm text-gray-600">Quantity: {material.quantity} {material.unit}</p>
                          {material.notes && (
                            <p className="text-sm text-gray-500 mt-1">Notes: {material.notes}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Item {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedRequest.raw_material?.name}</p>
                  <p className="text-sm text-gray-600">Type: {selectedRequest.raw_material?.type}</p>
                  <p className="text-sm text-gray-600">Quantity: {selectedRequest.quantity_requested} {selectedRequest.unit}</p>
                </div>
              )}
            </div>

            {/* Details Section - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {!isMultiItem && (
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
                      <p className="mt-1 p-2 bg-gray-50 rounded border">
                        {selectedRequest.quantity_requested} {selectedRequest.unit}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="supplier" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Supplier
                  </Label>
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
                    <p className="mt-1 p-2 bg-gray-50 rounded border">
                      {getSupplierName(selectedRequest.supplier_id)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eta" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Expected Delivery Date
                  </Label>
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
                    <p className="mt-1 p-2 bg-gray-50 rounded border">
                      {selectedRequest.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'}
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
              </div>
            </div>

            {/* Full Width - Notes */}
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
                  rows={4}
                  className="mt-1"
                  placeholder="Add notes about the request"
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded border min-h-[100px] whitespace-pre-wrap">
                  {selectedRequest.notes || 'No notes provided'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
              
              {/* WhatsApp Button */}
              {!isEditing && selectedRequest.status === 'Approved' && selectedRequest.supplier_id && (
                <Button 
                  variant="outline"
                  onClick={() => setIsWhatsAppDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send WhatsApp
                </Button>
              )}
              
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
                selectedRequest.status === 'Pending' && !isMultiItem && (
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

      <SendWhatsAppDialog
        isOpen={isWhatsAppDialogOpen}
        onOpenChange={setIsWhatsAppDialogOpen}
        request={selectedRequest}
      />
    </>
  );
};

export default ViewRequestDialog;
