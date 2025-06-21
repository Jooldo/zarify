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
  const [currentStatus, setCurrentStatus] = useState<string>('');
  
  const { toast } = useToast();
  const { suppliers } = useSuppliers();

  // Initialize editedRequest when selectedRequest changes
  useEffect(() => {
    if (selectedRequest) {
      setEditedRequest({ ...selectedRequest });
      setCurrentStatus(selectedRequest.status);
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
    // Update local state immediately
    setCurrentStatus(newStatus);
    
    try {
      await onUpdateRequestStatus(selectedRequest.id, newStatus);
      onRequestUpdated();
    } catch (error) {
      // Revert local state if update fails
      setCurrentStatus(selectedRequest.status);
    }
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

  // Use currentStatus instead of selectedRequest.status for display
  const displayStatus = currentStatus;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Request Details
              <Badge className={getStatusColor(displayStatus)}>
                {displayStatus}
              </Badge>
              {isMultiItem && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <ShoppingCart className="h-3 w-3" />
                  Multi-Item
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Compact Header Section */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Request #</p>
                  <p className="font-mono font-medium text-xs">{selectedRequest.request_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Requested</p>
                  <p className="text-xs">{new Date(selectedRequest.date_requested).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedRequest.raised_by && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Raised By</p>
                    <p className="text-xs">{selectedRequest.raised_by}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Total Qty</p>
                  <p className="font-medium text-xs">{getTotalQuantity()} {selectedRequest.unit}</p>
                </div>
              </div>
            </div>

            {/* Materials Section - More Compact */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-3 w-3" />
                {isMultiItem ? 'Materials' : 'Material'}
              </Label>
              
              {isMultiItem ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {multiItemMaterials.map((material, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-xs">{material.name} ({material.type})</p>
                          <p className="text-gray-600 text-xs">{material.quantity} {material.unit}</p>
                          {material.notes && <p className="text-gray-500 text-xs">{material.notes}</p>}
                        </div>
                        <Badge variant="outline" className="text-xs h-4 px-1">{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-xs">
                  <p className="font-medium text-xs">{selectedRequest.raw_material?.name} ({selectedRequest.raw_material?.type})</p>
                  <p className="text-gray-600 text-xs">{selectedRequest.quantity_requested} {selectedRequest.unit}</p>
                </div>
              )}
            </div>

            {/* Details Section - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-2">
                {!isMultiItem && (
                  <div>
                    <Label htmlFor="quantity" className="text-xs">Quantity</Label>
                    {isEditing ? (
                      <div className="flex gap-1 mt-1">
                        <Input
                          id="quantity"
                          type="number"
                          value={editedRequest.quantity_requested}
                          onChange={(e) => setEditedRequest({
                            ...editedRequest,
                            quantity_requested: parseInt(e.target.value) || 0
                          })}
                          min="1"
                          className="h-7 text-xs"
                        />
                        <Input
                          value={selectedRequest.unit}
                          disabled
                          className="w-12 h-7 bg-gray-50 text-xs"
                        />
                      </div>
                    ) : (
                      <p className="mt-1 p-1 bg-gray-50 rounded border text-xs">
                        {selectedRequest.quantity_requested} {selectedRequest.unit}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="supplier" className="text-xs flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
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
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder={
                            filteredSuppliers.length === 0 
                              ? "No suppliers available" 
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
                    </div>
                  ) : (
                    <p className="mt-1 p-1 bg-gray-50 rounded border text-xs">
                      {getSupplierName(selectedRequest.supplier_id)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div>
                  <Label htmlFor="eta" className="text-xs flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Expected Delivery
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
                      className="mt-1 h-7 text-xs"
                    />
                  ) : (
                    <p className="mt-1 p-1 bg-gray-50 rounded border text-xs">
                      {selectedRequest.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Status Update Section - Use displayStatus */}
                {!isEditing && displayStatus !== 'Received' && (
                  <div>
                    <Label className="text-xs">Update Status</Label>
                    <Select value={displayStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="mt-1 h-7 text-xs">
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

            {/* Notes Section */}
            <div>
              <Label htmlFor="notes" className="text-xs">Notes</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  value={editedRequest.notes || ''}
                  onChange={(e) => setEditedRequest({
                    ...editedRequest,
                    notes: e.target.value
                  })}
                  rows={2}
                  className="mt-1 text-xs"
                  placeholder="Add notes about the request"
                />
              ) : (
                <div className="mt-1 p-1 bg-gray-50 rounded border min-h-[40px] whitespace-pre-wrap text-xs">
                  {selectedRequest.notes || 'No notes provided'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                size="sm"
                className="text-xs h-7"
              >
                Close
              </Button>
              
              {/* WhatsApp Button */}
              {!isEditing && selectedRequest.status === 'Approved' && selectedRequest.supplier_id && (
                <Button 
                  variant="outline"
                  onClick={() => setIsWhatsAppDialogOpen(true)}
                  size="sm"
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
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
                    size="sm"
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={loading}
                    size="sm"
                    className="text-xs h-7"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                selectedRequest.status === 'Pending' && !isMultiItem && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="text-xs h-7"
                  >
                    Edit
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
