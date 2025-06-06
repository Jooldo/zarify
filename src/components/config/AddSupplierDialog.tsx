
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddSupplierDialogProps {
  onSupplierAdded: () => void;
}

const AddSupplierDialog = ({ onSupplierAdded }: AddSupplierDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    payment_terms: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) {
      return;
    }

    setLoading(true);
    try {
      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { error } = await supabase
        .from('suppliers')
        .insert({
          ...formData,
          merchant_id: merchantId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier added successfully',
      });

      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        payment_terms: '',
      });
      setOpen(false);
      onSupplierAdded();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-8 px-3 text-xs">
          <Plus className="h-3 w-3" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input 
              id="companyName" 
              placeholder="Enter company name" 
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input 
              id="contactPerson" 
              placeholder="Enter contact person name" 
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Enter email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input 
              id="paymentTerms" 
              placeholder="e.g., Net 30 days" 
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierDialog;
