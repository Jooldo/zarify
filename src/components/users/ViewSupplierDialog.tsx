
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface Supplier {
  id: string;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  payment_terms?: string;
  whatsapp_number?: string;
  whatsapp_enabled?: boolean;
  materials_supplied?: string[];
  created_at: string;
}

interface ViewSupplierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

const ViewSupplierDialog = ({ isOpen, onOpenChange, supplier }: ViewSupplierDialogProps) => {
  const { rawMaterials } = useRawMaterials();

  if (!supplier) return null;

  const getMaterialName = (materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    return material ? `${material.name} (${material.type})` : 'Unknown Material';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Supplier Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-sm font-semibold">{supplier.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Person</label>
              <p className="text-sm">{supplier.contact_person || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm">{supplier.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{supplier.email || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">WhatsApp Number</label>
              <p className="text-sm">{supplier.whatsapp_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Terms</label>
              <p className="text-sm">{supplier.payment_terms || '-'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">WhatsApp Notifications</label>
            <p className="text-sm">
              <Badge variant={supplier.whatsapp_enabled ? "default" : "secondary"}>
                {supplier.whatsapp_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Raw Materials Supplied</label>
            {supplier.materials_supplied && supplier.materials_supplied.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {supplier.materials_supplied.map((materialId) => (
                  <Badge key={materialId} variant="outline">
                    {getMaterialName(materialId)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No materials assigned</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-sm">{new Date(supplier.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSupplierDialog;
