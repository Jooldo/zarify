
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

interface EditSupplierFormProps {
  supplier: Supplier;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditSupplierForm = ({ supplier, onSuccess, onCancel }: EditSupplierFormProps) => {
  const { rawMaterials } = useRawMaterials();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(supplier.materials_supplied || []);
  const [formData, setFormData] = useState({
    company_name: supplier.company_name || '',
    contact_person: supplier.contact_person || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    payment_terms: supplier.payment_terms || '',
    whatsapp_number: supplier.whatsapp_number || '',
    whatsapp_enabled: supplier.whatsapp_enabled ?? true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMaterial = (materialId: string) => {
    if (!selectedMaterials.includes(materialId)) {
      setSelectedMaterials(prev => [...prev, materialId]);
    }
  };

  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(prev => prev.filter(id => id !== materialId));
  };

  const getMaterialName = (materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    return material ? `${material.name} (${material.type})` : 'Unknown Material';
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
      const { error } = await supabase
        .from('suppliers')
        .update({
          ...formData,
          materials_supplied: selectedMaterials.length > 0 ? selectedMaterials : null
        })
        .eq('id', supplier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update supplier',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableMaterials = rawMaterials.filter(m => !selectedMaterials.includes(m.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="whatsapp_enabled"
          checked={formData.whatsapp_enabled}
          onCheckedChange={(checked) => handleInputChange('whatsapp_enabled', checked)}
        />
        <Label htmlFor="whatsapp_enabled">Enable WhatsApp notifications</Label>
      </div>

      <div>
        <Label>Raw Materials Supplied</Label>
        <div className="space-y-2">
          {availableMaterials.length > 0 && (
            <div className="flex gap-2">
              <Select onValueChange={addMaterial}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select raw material to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedMaterials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMaterials.map((materialId) => (
                <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                  {getMaterialName(materialId)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeMaterial(materialId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Updating...' : 'Update Supplier'}
        </Button>
      </div>
    </form>
  );
};

export default EditSupplierForm;
