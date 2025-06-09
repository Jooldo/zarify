
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Scale, User, Calendar, Plus, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StepAssignmentDialog from './StepAssignmentDialog';
import ReceiptQCDialog from './ReceiptQCDialog';

interface ProductionQueueItem {
  id: string;
  product_code: string;
  category: string;
  subcategory: string;
  size: string;
  quantity_required: number;
  quantity_in_progress: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Queued' | 'In Progress' | 'Completed' | 'On Hold';
  estimated_completion: string;
  assigned_worker?: string;
  order_numbers: string[];
  created_date: string;
  current_step: number;
  manufacturing_steps: {
    step: number;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    completed_quantity: number;
    assignment?: {
      id: string;
      worker_name: string;
      delivery_date: string;
      status: string;
      materials: { name: string; allocated_weight: number; unit: string; }[];
    };
    qc_logs?: {
      received_weight: number;
      received_pieces: number;
      qc_passed_pieces: number;
      qc_failed_pieces: number;
      qc_passed_weight: number;
      qc_failed_weight: number;
    }[];
  }[];
  child_tickets?: {
    id: string;
    parent_step: number;
    quantity: number;
    failed_weight: number;
    reason: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    created_at: string;
  }[];
}

interface EnhancedUpdateProductionItemDialogProps {
  item: ProductionQueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedItem: ProductionQueueItem) => void;
}

const EnhancedUpdateProductionItemDialog = ({ 
  item, 
  open, 
  onOpenChange, 
  onUpdate 
}: EnhancedUpdateProductionItemDialogProps) => {
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const { toast } = useToast();

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignStep = (stepNumber: number) => {
    setSelectedStep(stepNumber);
    setShowAssignmentDialog(true);
  };

  const handleReceiptQC = (assignment: any, stepNumber: number) => {
    setSelectedAssignment(assignment);
    setSelectedStep(stepNumber);
    setShowReceiptDialog(true);
  };

  const handleAssignmentComplete = () => {
    toast({
      title: 'Assignment Created',
      description: 'Step assignment completed successfully.',
    });
    // Refresh the production item data here
  };

  const handleReceiptComplete = (qcData: any) => {
    toast({
      title: 'Receipt & QC Completed',
      description: 'Order received and quality control completed.',
    });
    // Update the production item with QC data here
  };

  if (!item) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-4 w-4" />
              Enhanced Manufacturing: {item.product_code}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Compact Product Info */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded text-sm">
              <div>
                <span className="font-medium">Product:</span> {item.category} • {item.subcategory}
              </div>
              <div>
                <span className="font-medium">Size:</span> {item.size}
              </div>
              <div>
                <span className="font-medium">Required:</span> {item.quantity_required}
              </div>
              <div>
                <span className="font-medium">Priority:</span>
                <Badge className="ml-1" variant="outline">{item.priority}</Badge>
              </div>
            </div>

            <Separator />

            {/* Enhanced Manufacturing Steps */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Manufacturing Steps with Assignments
              </h4>
              
              <div className="space-y-4">
                {item.manufacturing_steps.map((step) => (
                  <div key={step.step} className="border rounded-lg overflow-hidden">
                    {/* Step Header */}
                    <div className="bg-muted/30 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStepStatusColor(step.status)} variant="outline">
                            Step {step.step}
                          </Badge>
                          <span className="font-medium">{step.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({step.completed_quantity}/{item.quantity_required})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!step.assignment ? (
                            <Button
                              size="sm"
                              onClick={() => handleAssignStep(step.step)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Assign
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReceiptQC(step.assignment, step.step)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Receipt & QC
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assignment Details */}
                    {step.assignment && (
                      <div className="p-3 bg-blue-50/50 border-b">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">Worker:</span> {step.assignment.worker_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">Delivery:</span> {step.assignment.delivery_date}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <Badge className={`ml-1 ${getAssignmentStatusColor(step.assignment.status)}`} variant="outline">
                              {step.assignment.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Materials:</span> {step.assignment.materials.length}
                          </div>
                        </div>
                        
                        {/* Materials List */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {step.assignment.materials.map((material, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {material.name}: {material.allocated_weight}{material.unit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QC Logs */}
                    {step.qc_logs && step.qc_logs.length > 0 && (
                      <div className="p-3 bg-green-50/50 border-b">
                        <h5 className="font-medium text-sm mb-2">QC Results</h5>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="text-xs">
                                <TableHead className="h-8">Received</TableHead>
                                <TableHead className="h-8">QC Pass</TableHead>
                                <TableHead className="h-8">QC Fail</TableHead>
                                <TableHead className="h-8">Pass Weight</TableHead>
                                <TableHead className="h-8">Fail Weight</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {step.qc_logs.map((qcLog, index) => (
                                <TableRow key={index} className="text-xs">
                                  <TableCell>{qcLog.received_pieces} pcs</TableCell>
                                  <TableCell className="text-green-600">{qcLog.qc_passed_pieces}</TableCell>
                                  <TableCell className="text-red-600">{qcLog.qc_failed_pieces}</TableCell>
                                  <TableCell className="text-green-600">{qcLog.qc_passed_weight}kg</TableCell>
                                  <TableCell className="text-red-600">{qcLog.qc_failed_weight}kg</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Child Tickets for Failed QC */}
                    {item.child_tickets?.filter(ticket => ticket.parent_step === step.step).length > 0 && (
                      <div className="p-3 bg-red-50/50">
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          Rework Tickets
                        </h5>
                        <div className="space-y-2">
                          {item.child_tickets
                            ?.filter(ticket => ticket.parent_step === step.step)
                            .map((ticket) => (
                              <div key={ticket.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{ticket.id}</span>
                                  <span>•</span>
                                  <span>{ticket.quantity} pieces ({ticket.failed_weight}kg)</span>
                                  <span>•</span>
                                  <span className="text-muted-foreground">{ticket.reason}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.status}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step Assignment Dialog */}
      <StepAssignmentDialog
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        productionItemId={item.id}
        stepNumber={selectedStep}
        stepName={item.manufacturing_steps.find(s => s.step === selectedStep)?.name || ''}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Receipt & QC Dialog */}
      <ReceiptQCDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        assignment={selectedAssignment}
        stepNumber={selectedStep}
        stepName={item.manufacturing_steps.find(s => s.step === selectedStep)?.name || ''}
        onReceiptComplete={handleReceiptComplete}
      />
    </>
  );
};

export default EnhancedUpdateProductionItemDialog;
