
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_id: string;
  merchant_id: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  order_item_id: string;
  product_config_id: string;
  merchant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]) => {
    try {
      console.log('Creating invoice with data:', invoiceData);
      console.log('Invoice items:', items);

      // Get next invoice number
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('get_next_invoice_number');

      if (numberError) throw numberError;

      // Create invoice with required fields
      const invoiceToInsert = {
        invoice_number: invoiceNumber,
        order_id: invoiceData.order_id!,
        customer_id: invoiceData.customer_id!,
        invoice_date: invoiceData.invoice_date!,
        due_date: invoiceData.due_date || null,
        subtotal: invoiceData.subtotal!,
        tax_amount: invoiceData.tax_amount!,
        discount_amount: invoiceData.discount_amount!,
        total_amount: invoiceData.total_amount!,
        notes: invoiceData.notes || null,
        status: invoiceData.status || 'Draft',
      };

      console.log('Inserting invoice:', invoiceToInsert);

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceToInsert)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      console.log('Created invoice:', invoice);

      // Create invoice items with required fields
      const invoiceItemsToInsert = items.map(item => ({
        invoice_id: invoice.id,
        order_item_id: item.order_item_id!,
        product_config_id: item.product_config_id!,
        quantity: item.quantity!,
        unit_price: item.unit_price!,
        total_price: item.total_price!,
      }));

      console.log('Inserting invoice items:', invoiceItemsToInsert);

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: `Invoice ${invoiceNumber} created successfully`,
      });

      fetchInvoices();
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getInvoiceByOrderId = (orderId: string) => {
    return invoices.find(invoice => invoice.order_id === orderId);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    createInvoice,
    getInvoiceByOrderId,
    refetch: fetchInvoices,
  };
};
