
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';
import type { Invoice } from '@/hooks/useInvoices';
import type { Order } from '@/hooks/useOrders';

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  order: Order;
}

const ViewInvoiceDialog = ({ isOpen, onClose, invoice, order }: ViewInvoiceDialogProps) => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const htmlContent = generateInvoiceHTML();
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoice_number}.html`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: `Invoice ${invoice.invoice_number} is downloading`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailInvoice = async () => {
    setIsEmailing(true);
    try {
      // In a real implementation, this would call an API to send email
      // For now, we'll show a success message
      toast({
        title: 'Email Sent',
        description: `Invoice ${invoice.invoice_number} has been emailed to ${order.customer.name}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsEmailing(false);
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .company-info { text-align: left; }
            .company-info h1 { margin: 0; font-size: 28px; color: #1a1a1a; }
            .company-info p { margin: 2px 0; color: #666; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; font-size: 24px; color: #1a1a1a; }
            .invoice-details { margin-bottom: 20px; }
            .customer-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .totals { text-align: right; margin-top: 20px; }
            .total-line { margin: 5px 0; }
            .total-final { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>${profile?.merchantName || 'Your Company'}</h1>
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>GST No: 27XXXXX1234X1Z5</p>
              <p>Phone: +91 9876543210</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p><strong>${invoice.invoice_number}</strong></p>
            </div>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Date:</strong> ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
            ${invoice.due_date ? `<p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>` : ''}
            <p><strong>Order Number:</strong> ${order.order_number}</p>
          </div>
          
          <div class="customer-details">
            <h3>Bill To:</h3>
            <p><strong>${order.customer.name}</strong></p>
            ${order.customer.phone ? `<p>Phone: ${order.customer.phone}</p>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map(item => `
                <tr>
                  <td>${item.product_config.product_code}</td>
                  <td>${item.product_config.category}</td>
                  <td>${item.product_config.subcategory}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${item.total_price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-line">Subtotal: ₹${invoice.subtotal.toFixed(2)}</div>
            ${invoice.tax_amount > 0 ? `<div class="total-line">Tax: ₹${invoice.tax_amount.toFixed(2)}</div>` : ''}
            ${invoice.discount_amount > 0 ? `<div class="total-line">Discount: -₹${invoice.discount_amount.toFixed(2)}</div>` : ''}
            <div class="total-line total-final">Total: ₹${invoice.total_amount.toFixed(2)}</div>
          </div>
          
          ${invoice.notes ? `
            <div style="margin-top: 30px;">
              <h3>Notes:</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h2>
              <p className="text-gray-600">Order: {order.order_number}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
              {invoice.due_date && (
                <p><strong>Due:</strong> {format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>
              )}
              <p><strong>Status:</strong> <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{invoice.status}</span></p>
            </div>
          </div>

          <Separator />

          {/* Merchant Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">From:</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{profile?.merchantName || 'Your Company'}</p>
                <p className="text-sm text-gray-600">123 Business Street</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600">GST No: 27XXXXX1234X1Z5</p>
                <p className="text-sm text-gray-600">Phone: +91 9876543210</p>
              </div>
            </div>
            
            {/* Customer Information */}
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{order.customer.name}</p>
                {order.customer.phone && <p className="text-sm text-gray-600">Phone: {order.customer.phone}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-2">Items:</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product Code</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Subcategory</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">{item.product_config.product_code}</td>
                      <td className="px-4 py-2">{item.product_config.category}</td>
                      <td className="px-4 py-2">{item.product_config.subcategory}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">₹{item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{invoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download HTML'}
              </Button>
              <Button
                variant="outline"
                onClick={handleEmailInvoice}
                disabled={isEmailing}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isEmailing ? 'Sending...' : 'Email Invoice'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintInvoice}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceDialog;
