
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';
import type { Order } from '@/hooks/useOrders';

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onInvoiceCreated?: () => void;
}

const CreateInvoiceDialog = ({ isOpen, onClose, order, onInvoiceCreated }: CreateInvoiceDialogProps) => {
  const { createInvoice } = useInvoices();
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = order.total_amount;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        order_id: order.id,
        customer_id: order.customer.id,
        invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes,
        status: 'Draft',
      };

      const invoiceItems = order.order_items.map(item => ({
        order_item_id: item.id,
        product_config_id: item.product_config.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      await createInvoice(invoiceData, invoiceItems);
      onInvoiceCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice - Order {order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="font-medium">Customer Information</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p><strong>Name:</strong> {order.customer.name}</p>
              {order.customer.phone && <p><strong>Phone:</strong> {order.customer.phone}</p>}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="font-medium">Order Items</h3>
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product_config.product_code}</p>
                    <p className="text-sm text-gray-600">
                      {item.product_config.category} - {item.product_config.subcategory}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{item.quantity} × ₹{item.unit_price}</p>
                    <p className="font-medium">₹{item.total_price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => date && setInvoiceDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Financial Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax Amount (₹)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount Amount (₹)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes for the invoice..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
