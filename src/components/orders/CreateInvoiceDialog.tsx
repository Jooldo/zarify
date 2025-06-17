
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { useOrderLogging } from '@/hooks/useOrderLogging';

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onInvoiceCreated: () => void;
}

const CreateInvoiceDialog = ({ isOpen, onClose, order, onInvoiceCreated }: CreateInvoiceDialogProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logInvoiceCreated } = useOrderLogging();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Could not get merchant ID');
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          order_id: order.id,
          customer_id: order.customer_id, // Add the required customer_id
          invoice_number: invoiceNumber,
          total_amount: order.total_amount,
          merchant_id: merchantId,
        })
        .select('*')
        .single();

      if (error) throw error;

      const invoice = data;

      if (invoice) {
        // Log the invoice creation
        await logInvoiceCreated(order.id, order.order_number, invoice.invoice_number);
        
        toast({
          title: 'Success',
          description: `Invoice ${invoice.invoice_number} created successfully!`,
        });
        onInvoiceCreated();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
