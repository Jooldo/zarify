
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddWorkerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddWorkerForm = ({ onSuccess, onCancel }: AddWorkerFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    role: '',
    notes: '',
    status: 'Active' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Worker name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const workerData = {
        name: formData.name.trim(),
        contact_number: formData.contact_number.trim() || null,
        role: formData.role.trim() || null,
        notes: formData.notes.trim() || null,
        status: formData.status,
        merchant_id: merchantId
      };

      const { error } = await supabase
        .from('workers')
        .insert(workerData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Worker added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding worker:', error);
      toast({
        title: "Error",
        description: "Failed to add worker",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Worker Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter worker name"
            className="text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => handleChange('contact_number', e.target.value)}
            placeholder="Enter contact number"
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="e.g., Goldsmith, Polisher"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes about the worker"
          className="text-sm min-h-20"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-sm"
        >
          {isSubmitting ? 'Adding...' : 'Add Worker'}
        </Button>
      </div>
    </form>
  );
};

export default AddWorkerForm;
