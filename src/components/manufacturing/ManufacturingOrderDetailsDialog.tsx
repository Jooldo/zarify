
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ManufacturingOrder } from '@/types/manufacturing';

interface ManufacturingOrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onStatusUpdate: (orderId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}

const ManufacturingOrderDetailsDialog = ({
  order,
  open,
  onOpenChange,
  getPriorityColor,
  getStatusColor,
  onStatusUpdate,
}: ManufacturingOrderDetailsDialogProps) => {
  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manufacturing Order Details</DialogTitle>
          <DialogDescription>
            {`Order Number: ${order.order_number}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Information</h3>
            <p>
              <strong>Product Name:</strong> {order.product_name}
            </p>
            <p>
              <strong>Quantity Required:</strong> {order.quantity_required}
            </p>
            <p>
              <strong>Priority:</strong>
              <span className={`px-2 py-1 rounded-full font-semibold text-xs ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </span>
            </p>
            <p>
              <strong>Status:</strong>
              <span className={`px-2 py-1 rounded-full font-semibold text-xs ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </p>
            {order.due_date && (
              <p>
                <strong>Due Date:</strong> {order.due_date}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
            {order.special_instructions && (
              <p>
                <strong>Special Instructions:</strong> {order.special_instructions}
              </p>
            )}
            <p>
              <strong>Created By:</strong> {order.created_by || 'N/A'}
            </p>
            <p>
              <strong>Created At:</strong> {order.created_at}
            </p>
            <p>
              <strong>Updated At:</strong> {order.updated_at}
            </p>
            {order.started_at && (
              <p>
                <strong>Started At:</strong> {order.started_at}
              </p>
            )}
            {order.completed_at && (
              <p>
                <strong>Completed At:</strong> {order.completed_at}
              </p>
            )}
          </div>
        </div>

        {order.product_configs && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Product Configuration</h3>
            <p>
              <strong>Product Code:</strong> {order.product_configs.product_code}
            </p>
            <p>
              <strong>Category:</strong> {order.product_configs.category}
            </p>
            <p>
              <strong>Subcategory:</strong> {order.product_configs.subcategory}
            </p>
            {order.product_configs.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mt-2">Materials Required</h4>
                <ul>
                  {order.product_configs.product_config_materials.map(material => (
                    <li key={material.id}>
                      {material.raw_materials.name} - {material.quantity_required} {material.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManufacturingOrderDetailsDialog;
