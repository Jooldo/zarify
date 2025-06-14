
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package2, Calendar, User, FileText, Calculator, Play, Truck, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import StartStepDialog from './StartStepDialog';

interface ManufacturingOrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onStatusUpdate?: (orderId: string, status: 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'cancelled') => void;
}

const ManufacturingOrderDetailsDialog: React.FC<ManufacturingOrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  getPriorityColor,
  getStatusColor
}) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  if (!order) return null;

  // Get the first step that should be started
  const getNextStep = () => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
    
    if (currentOrderSteps.length === 0) {
      // No steps exist, get the first manufacturing step
      return manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
    }
    
    // Find the next pending step
    const nextPendingStep = currentOrderSteps
      .filter(step => step.status === 'pending')
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))[0];
    
    return nextPendingStep?.manufacturing_steps;
  };

  const nextStep = getNextStep();
  const hasStarted = orderSteps.some(step => step.manufacturing_order_id === order.id && step.status !== 'pending');

  const handleStartStep = () => {
    if (nextStep) {
      setSelectedStep(nextStep);
      setStartStepDialogOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="text-xl font-semibold">{order.product_name}</span>
                <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
                <Badge className={`${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Quantity</span>
                  </div>
                  <span className="font-semibold">{order.quantity_required}</span>
                </div>
                
                {order.due_date && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Due Date</span>
                    </div>
                    <span className="font-semibold">{format(new Date(order.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Created</span>
                  </div>
                  <span className="font-semibold">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                </div>

                {order.product_configs && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Product Code</span>
                    </div>
                    <span className="font-semibold font-mono">{order.product_configs.product_code}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raw Material Requirements */}
            {order.product_configs?.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Raw Material Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Per Unit</TableHead>
                        <TableHead>Total Required</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.product_configs.product_config_materials.map((material, index) => {
                        const totalRequired = material.quantity_required * order.quantity_required;
                        
                        return (
                          <TableRow key={material.id || index}>
                            <TableCell className="font-medium">
                              {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                            </TableCell>
                            <TableCell>{material.quantity_required}</TableCell>
                            <TableCell className="font-semibold">{totalRequired.toFixed(1)}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.special_instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Start Production Button */}
            {nextStep && !hasStarted && (
              <div className="flex justify-center pt-4 border-t">
                <Button 
                  onClick={handleStartStep}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start {nextStep.step_name}
                </Button>
              </div>
            )}

            {hasStarted && (
              <div className="flex justify-center pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Production Started</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={order}
        step={selectedStep}
      />
    </>
  );
};

export default ManufacturingOrderDetailsDialog;
