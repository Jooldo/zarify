
import { useActivityLog } from '@/hooks/useActivityLog';
import { OrderStatus } from '@/hooks/useOrders';

export const useOrderLogging = () => {
  const { logActivity } = useActivityLog();

  const logOrderCreated = async (orderId: string, orderNumber: string, customerName: string, totalAmount: number) => {
    await logActivity(
      'Created',
      'Order',
      orderId,
      `Created order ${orderNumber} for ${customerName} with total amount ₹${totalAmount.toFixed(2)}`
    );
  };

  const logOrderStatusUpdate = async (orderId: string, orderNumber: string, oldStatus: OrderStatus, newStatus: OrderStatus) => {
    await logActivity(
      'Status Updated',
      'Order',
      orderId,
      `Order ${orderNumber} status changed from ${oldStatus} to ${newStatus}`
    );
  };

  const logOrderItemStatusUpdate = async (orderId: string, orderNumber: string, productCode: string, oldStatus: OrderStatus, newStatus: OrderStatus) => {
    await logActivity(
      'Item Status Updated',
      'Order Item',
      orderId,
      `Order ${orderNumber} item ${productCode} status changed from ${oldStatus} to ${newStatus}`
    );
  };

  const logOrderEdited = async (orderId: string, orderNumber: string, changes: string) => {
    await logActivity(
      'Edited',
      'Order',
      orderId,
      `Order ${orderNumber} updated: ${changes}`
    );
  };

  const logInvoiceCreated = async (orderId: string, orderNumber: string, invoiceNumber: string) => {
    await logActivity(
      'Invoice Created',
      'Order',
      orderId,
      `Invoice ${invoiceNumber} created for order ${orderNumber}`
    );
  };

  return {
    logOrderCreated,
    logOrderStatusUpdate,
    logOrderItemStatusUpdate,
    logOrderEdited,
    logInvoiceCreated
  };
};
