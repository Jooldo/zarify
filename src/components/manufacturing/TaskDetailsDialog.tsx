
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, User, Calendar, Clock, FileText, ArrowRight, Weight, Hash, Calculator, Package2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useRawMaterials } from '@/hooks/useRawMaterials';

// Temporary type definition for ProductionTask until manufacturing is reworked
interface ProductionTask {
  id: string;
  product_config_id?: string;
  quantity: number;
  status?: string;
  priority: string;
  customer_name?: string;
  notes?: string;
  created_at: string;
  expected_date?: string;
  assigned_worker_name?: string;
  started_at?: string;
  received_weight?: number;
  received_quantity?: number;
  completed_weight?: number;
  completed_quantity?: number;
  is_child_task?: boolean;
  parent_task_id?: string;
  product_configs?: {
    product_code: string;
    category: string;
    subcategory: string;
  };
}

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProductionTask | null;
  stepId?: string;
  onStatusUpdate?: (taskId: string, newStatus: string, additionalData?: { 
    weight?: number; 
    quantity?: number;
    completedWeight?: number;
    completedQuantity?: number;
    createChildTask?: boolean;
  }) => void;
}

const STEP_STATUSES = [
  { value: 'Progress', label: 'In Progress' },
  { value: 'Partially Completed', label: 'Partially Completed' },
  { value: 'Completed', label: 'Completed' }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Progress': return 'bg-blue-100 text-blue-800';
    case 'Received': return 'bg-green-100 text-green-800';
    case 'QC': return 'bg-orange-100 text-orange-800';
    case 'Partially Completed': return 'bg-yellow-100 text-yellow-800';
    case 'Completed': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeElapsed = (startedAt: string) => {
  const now = new Date();
  const started = new Date(startedAt);
  const elapsed = Math.floor((now.getTime() - started.getTime()) / 60000);
  if (elapsed < 60) return `${elapsed} minutes`;
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;
  return `${hours} hours ${minutes} minutes`;
};

const TaskDetailsDialog = ({ open, onOpenChange, task, stepId, onStatusUpdate }: TaskDetailsDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [numberOfPieces, setNumberOfPieces] = useState('');
  const [completedWeight, setCompletedWeight] = useState('');
  const [completedQuantity, setCompletedQuantity] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showPartialCompletionForm, setShowPartialCompletionForm] = useState(false);
  const [totalWeightFromMaterials, setTotalWeightFromMaterials] = useState<number | null>(null);
  const { toast } = useToast();
  const { productConfigs } = useProductConfigs();
  const { rawMaterials } = useRawMaterials();

  useEffect(() => {
    if (task && productConfigs.length > 0) {
      // Find the product configuration for this task
      const productConfig = productConfigs.find(config => 
        config.id === task.product_config_id ||
        config.product_code === task.product_configs?.product_code ||
        (config.category === task.product_configs?.category && config.subcategory === task.product_configs?.subcategory)
      );

      if (productConfig && productConfig.product_config_materials) {
        // Calculate total weight from raw materials for the quantity in this task
        const totalMaterialWeight = productConfig.product_config_materials.reduce((total, material) => {
          return total + (material.quantity_required * task.quantity);
        }, 0);
        
        setTotalWeightFromMaterials(totalMaterialWeight);
      } else {
        setTotalWeightFromMaterials(null);
      }
    }
  }, [task, productConfigs]);

  if (!task) return null;

  const isProcessingStep = stepId === 'jhalai' || stepId === 'quellai';
  const currentStatus = task.status || 'Progress';

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus === 'Completed') {
      setShowCompletionForm(true);
      setShowPartialCompletionForm(false);
    } else if (newStatus === 'Partially Completed') {
      setShowPartialCompletionForm(true);
      setShowCompletionForm(false);
    } else {
      setShowCompletionForm(false);
      setShowPartialCompletionForm(false);
      handleStatusUpdate(newStatus);
    }
  };

  const handleStatusUpdate = (status: string, additionalData?: { 
    weight?: number; 
    quantity?: number;
    completedWeight?: number;
    completedQuantity?: number;
    createChildTask?: boolean;
  }) => {
    if (!onStatusUpdate) return;

    onStatusUpdate(task.id, status, additionalData);
    
    toast({
      title: 'Status Updated',
      description: `Task status updated to ${status}`,
    });

    // Reset form
    setSelectedStatus('');
    setFinalWeight('');
    setNumberOfPieces('');
    setCompletedWeight('');
    setCompletedQuantity('');
    setShowCompletionForm(false);
    setShowPartialCompletionForm(false);
    onOpenChange(false);
  };

  const handleCompletionSubmit = () => {
    if (!finalWeight || !numberOfPieces) {
      toast({
        title: 'Error',
        description: 'Please enter both final weight and number of pieces',
        variant: 'destructive',
      });
      return;
    }

    handleStatusUpdate('Completed', {
      completedWeight: parseFloat(finalWeight),
      completedQuantity: parseInt(numberOfPieces)
    });
  };

  const handlePartialCompletionSubmit = () => {
    if (!completedWeight || !completedQuantity) {
      toast({
        title: 'Error',
        description: 'Please enter both completed weight and quantity',
        variant: 'destructive',
      });
      return;
    }

    const completedWeightNum = parseFloat(completedWeight);
    const completedQuantityNum = parseInt(completedQuantity);
    const receivedWeightNum = task.received_weight || totalWeightFromMaterials || 0;
    const receivedQuantityNum = task.received_quantity || task.quantity || 0;

    if (completedWeightNum > receivedWeightNum || completedQuantityNum > receivedQuantityNum) {
      toast({
        title: 'Error',
        description: 'Completed amount cannot exceed received amount',
        variant: 'destructive',
      });
      return;
    }

    handleStatusUpdate('Partially Completed', {
      completedWeight: completedWeightNum,
      completedQuantity: completedQuantityNum,
      createChildTask: true
    });
  };

  // Get the assigned weight for Jhalai step
  const getAssignedWeight = () => {
    if (stepId === 'jhalai') {
      return task.received_weight || totalWeightFromMaterials || 0;
    }
    return task.received_weight || 0;
  };

  const productCode = task.product_configs?.product_code || 'Unknown';
  const category = task.product_configs?.category || task.customer_name;
  const subcategory = task.product_configs?.subcategory || 'Production Request';

  // Get product config and materials for the table
  const productConfig = productConfigs.find(config => 
    config.id === task.product_config_id ||
    config.product_code === task.product_configs?.product_code ||
    (config.category === task.product_configs?.category && config.subcategory === task.product_configs?.subcategory)
  );

  // Helper function to get raw material name by ID
  const getRawMaterialName = (materialId: string) => {
    const material = rawMaterials.find(rm => rm.id === materialId);
    return material ? material.name : `Material #${materialId.slice(-6)}`;
  };

  // Helper function to get raw material current stock by ID
  const getRawMaterialStock = (materialId: string) => {
    const material = rawMaterials.find(rm => rm.id === materialId);
    return material ? material.current_stock : 0;
  };

  // Helper function to get raw material unit by ID
  const getRawMaterialUnit = (materialId: string) => {
    const material = rawMaterials.find(rm => rm.id === materialId);
    return material ? material.unit : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stepId === 'jhalai' ? 'Jhalai' : stepId === 'quellai' ? 'Quellai' : 'Production'} Task Details
            {task.is_child_task && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Remaining Work
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Note: Manufacturing Step History removed - will be reimplemented */}

          {/* Header Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-blue-900">{category}</h3>
                <p className="text-blue-700">{subcategory}</p>
                <p className="text-sm text-blue-600 font-mono mt-1">{productCode}</p>
                {task.parent_task_id && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Remaining from parent task
                  </p>
                )}
              </div>
              <div className="text-right">
                <Badge className={`mb-2 ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </Badge>
                {isProcessingStep && (
                  <Badge className={`block mb-2 ${getStatusColor(currentStatus)}`}>
                    {currentStatus}
                  </Badge>
                )}
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-900">{task.quantity}</span>
                  <span className="text-sm text-blue-600 ml-1">pieces</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Material Requirements Table */}
          {productConfig && productConfig.product_config_materials && productConfig.product_config_materials.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Raw Material Requirements
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Material</TableHead>
                      <TableHead className="font-semibold text-center">Total Required</TableHead>
                      <TableHead className="font-semibold text-center">Current Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productConfig.product_config_materials.map((material, index) => {
                      const totalRequired = material.quantity_required * task.quantity;
                      const currentStock = getRawMaterialStock(material.raw_material_id);
                      const unit = getRawMaterialUnit(material.raw_material_id);
                      
                      return (
                        <TableRow key={material.id || index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {getRawMaterialName(material.raw_material_id)}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {totalRequired.toFixed(2)} {unit}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={currentStock < totalRequired ? 'text-red-600 font-semibold' : 'text-green-600'}>
                              {currentStock} {unit}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Manufacturing functionality sections removed - will be reimplemented */}

          {/* Timeline Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            
            <div className="space-y-3">
              {task.created_at && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{format(new Date(task.created_at), 'PPP')}</p>
                  </div>
                </div>
              )}
              
              {task.expected_date && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="font-medium">{format(new Date(task.expected_date), 'PPP')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Information */}
          {(task.assigned_worker_name || task.started_at) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignment Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.assigned_worker_name && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Assigned Worker</p>
                      <p className="font-medium text-green-800">{task.assigned_worker_name}</p>
                    </div>
                  </div>
                )}
                
                {task.started_at && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Time Elapsed</p>
                      <p className="font-medium text-blue-800">{formatTimeElapsed(task.started_at)}</p>
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
