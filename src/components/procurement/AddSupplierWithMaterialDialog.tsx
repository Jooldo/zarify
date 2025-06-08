
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface AddSupplierWithMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedMaterial?: RawMaterial;
  onSupplierAdded: () => void;
}

const AddSupplierWithMaterialDialog = ({ 
  isOpen, 
  onOpenChange, 
  preSelectedMaterial,
  onSupplierAdded 
}: AddSupplierWithMaterialDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    payment_terms: '',
    whatsapp_number: '',
    whatsapp_enabled: true,
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      toast({
        title: 'Error',
        description: 'Company name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Include pre-selected material if provided
      const materialsSupplied = preSelectedMaterial ? [preSelectedMaterial.id] : [];

      const { error } = await supabase
        .from('suppliers')
        .insert({
          ...formData,
          merchant_id: merchantId,
          materials_supplied: materialsSupplied.length > 0 ? materialsSupplied : null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier added successfully',
      });

      // Reset form
      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        payment_terms: '',
        whatsapp_number: '',
        whatsapp_enabled: true,
      });
      
      onSupplierAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to add supplier',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              placeholder="Enter contact person"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
              placeholder="Enter WhatsApp number"
            />
          </div>

          <div>
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Input
              id="payment_terms"
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', e.target.value)}
              placeholder="e.g., Net 30 days"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp_enabled"
              checked={formData.whatsapp_enabled}
              onCheckedChange={(checked) => handleInputChange('whatsapp_enabled', checked)}
            />
            <Label htmlFor="whatsapp_enabled">Enable WhatsApp notifications</Label>
          </div>

          {preSelectedMaterial && (
            <div>
              <Label>Raw Materials Supplied</Label>
              <div className="mt-2">
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  {preSelectedMaterial.name} ({preSelectedMaterial.type})
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierWithMaterialDialog;
