
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Request Details
              <Badge className={getStatusColor(selectedRequest.status)}>
                {selectedRequest.status}
              </Badge>
              {isMultiItem && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Multi-Item
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Compact Header Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Request #</p>
                  <p className="font-mono font-medium">{selectedRequest.request_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Requested</p>
                  <p>{new Date(selectedRequest.date_requested).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedRequest.raised_by && (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Raised By</p>
                    <p>{selectedRequest.raised_by}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Total Qty</p>
                  <p className="font-medium">{getTotalQuantity()} {selectedRequest.unit}</p>
                </div>
              </div>
            </div>

            {/* Materials Section - More Compact */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-3 w-3" />
                {isMultiItem ? 'Materials' : 'Material'}
              </Label>
              
              {isMultiItem ? (
                <div className="space-y-2">
                  {multiItemMaterials.map((material, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{material.name} ({material.type})</p>
                          <p className="text-gray-600">{material.quantity} {material.unit}</p>
                          {material.notes && <p className="text-gray-500 text-xs">{material.notes}</p>}
                        </div>
                        <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  <p className="font-medium">{selectedRequest.raw_material?.name} ({selectedRequest.raw_material?.type})</p>
                  <p className="text-gray-600">{selectedRequest.quantity_requested} {selectedRequest.unit}</p>
                </div>
              )}
            </div>

            {/* Details Section - Compact Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                {!isMultiItem && (
                  <div>
                    <Label htmlFor="quantity" className="text-sm">Quantity</Label>
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
                          className="flex-1 h-8"
                        />
                        <Input
                          value={selectedRequest.unit}
                          disabled
                          className="w-16 h-8 bg-gray-50 text-xs"
                        />
                      </div>
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {selectedRequest.quantity_requested} {selectedRequest.unit}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="supplier" className="text-sm flex items-center gap-1">
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
                        <SelectTrigger className="h-8">
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
                    <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                      {getSupplierName(selectedRequest.supplier_id)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="eta" className="text-sm flex items-center gap-1">
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
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                      {selectedRequest.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <Label htmlFor="notes" className="text-sm">Notes</Label>
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
                  placeholder="Add notes about the request"
                />
              ) : (
                <div className="mt-1 p-2 bg-gray-50 rounded border min-h-[60px] whitespace-pre-wrap text-sm">
                  {selectedRequest.notes || 'No notes provided'}
                </div>
              )}
            </div>

            {/* Status Update Section - After Notes */}
            {!isEditing && selectedRequest.status !== 'Received' && (
              <div>
                <Label className="text-sm">Update Status</Label>
                <Select value={selectedRequest.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1 h-8">
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
            <div className="flex gap-2 pt-3 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                size="sm"
              >
                Close
              </Button>
              
              {/* WhatsApp Button */}
              {!isEditing && selectedRequest.status === 'Approved' && selectedRequest.supplier_id && (
                <Button 
                  variant="outline"
                  onClick={() => setIsWhatsAppDialogOpen(true)}
                  size="sm"
                  className="flex items-center gap-1"
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
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                selectedRequest.status === 'Pending' && !isMultiItem && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    size="sm"
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
