
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Calendar, Clock, FileText, Building2, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface ProductionTask {
  id: string;
  productCode: string;
  category: string;
  subcategory: string;
  quantity: number;
  orderNumber: string;
  customerName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedWorker?: string;
  estimatedTime?: number;
  startedAt?: Date;
  notes?: string;
  expectedDate?: Date;
  createdAt?: Date;
}

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProductionTask | null;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTimeElapsed = (startedAt: Date) => {
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 60000);
  if (elapsed < 60) return `${elapsed} minutes`;
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;
  return `${hours} hours ${minutes} minutes`;
};

const TaskDetailsDialog = ({ open, onOpenChange, task }: TaskDetailsDialogProps) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Production Task Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-blue-900">{task.category}</h3>
                <p className="text-blue-700">{task.subcategory}</p>
                <p className="text-sm text-blue-600 font-mono mt-1">{task.productCode}</p>
              </div>
              <div className="text-right">
                <Badge className={`mb-2 ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </Badge>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-900">{task.quantity}</span>
                  <span className="text-sm text-blue-600 ml-1">pieces</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Order Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium">{task.orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{task.customerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h4>
              
              <div className="space-y-3">
                {task.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{format(task.createdAt, 'PPP')}</p>
                    </div>
                  </div>
                )}
                
                {task.expectedDate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Expected Delivery</p>
                      <p className="font-medium">{format(task.expectedDate, 'PPP')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          {(task.assignedWorker || task.startedAt) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignment Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.assignedWorker && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Assigned Worker</p>
                      <p className="font-medium text-green-800">{task.assignedWorker}</p>
                    </div>
                  </div>
                )}
                
                {task.startedAt && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Time Elapsed</p>
                      <p className="font-medium text-blue-800">{formatTimeElapsed(task.startedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h4>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-gray-700">{task.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
