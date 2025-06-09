
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, User, Clock, Weight, ChevronDown, ChevronUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductionTask } from '@/hooks/useProductionTasks';
import { useWorkers } from '@/hooks/useWorkers';
import { useProductionStepHistory } from '@/hooks/useProductionStepHistory';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProductionTask | null;
  onAssign: (assignment: {
    taskId: string;
    workerId: string;
    workerName: string;
    expectedDate: Date;
    remarks?: string;
  }) => void;
}

const getNextStepName = (currentStep: string) => {
  const stepSequence = ['pending', 'jhalai', 'quellai', 'meena', 'vibrator', 'quality-check', 'completed'];
  const currentIndex = stepSequence.indexOf(currentStep);
  if (currentIndex !== -1 && currentIndex < stepSequence.length - 1) {
    const nextStep = stepSequence[currentIndex + 1];
    return nextStep.charAt(0).toUpperCase() + nextStep.slice(1).replace('-', ' ');
  }
  return 'Next Step';
};

const calculateLossPercentage = (input: number, output: number) => {
  if (input === 0) return 0;
  return ((input - output) / input) * 100;
};

const AssignmentDialog = ({ open, onOpenChange, task, onAssign }: AssignmentDialogProps) => {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [remarks, setRemarks] = useState('');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const { toast } = useToast();
  const { workers } = useWorkers();
  const { stepHistory } = useProductionStepHistory(task?.id);

  // Set default expected date to 3 days from now
  useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    setExpectedDate(defaultDate);
  });

  if (!task) return null;

  const nextStepName = getNextStepName(task.current_step);
  const latestStep = stepHistory[stepHistory.length - 1];
  const hasQuantityReduction = latestStep && latestStep.input_quantity && latestStep.output_quantity && latestStep.input_quantity > latestStep.output_quantity;
  const hasWeightLoss = latestStep && latestStep.input_weight && latestStep.output_weight && latestStep.input_weight > latestStep.output_weight;
  const weightLossPercentage = latestStep && latestStep.input_weight && latestStep.output_weight ? calculateLossPercentage(latestStep.input_weight, latestStep.output_weight) : 0;

  const handleAssign = () => {
    if (!selectedWorker) {
      toast({
        title: 'Error',
        description: 'Please select a worker',
        variant: 'destructive',
      });
      return;
    }

    if (!expectedDate) {
      toast({
        title: 'Error',
        description: 'Please select an expected delivery date',
        variant: 'destructive',
      });
      return;
    }

    const worker = workers.find(w => w.id === selectedWorker);
    if (!worker) return;

    onAssign({
      taskId: task.id,
      workerId: selectedWorker,
      workerName: worker.name,
      expectedDate,
      remarks: remarks || undefined,
    });

    // Reset form
    setSelectedWorker('');
    setRemarks('');
    onOpenChange(false);

    toast({
      title: 'Success',
      description: `Task assigned and moved to ${nextStepName}`,
    });
  };

  const productCode = task.product_configs?.product_code || 'Unknown';
  const category = task.product_configs?.category || task.customer_name;
  const subcategory = task.product_configs?.subcategory || 'Production Request';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign to {nextStepName}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Manufacturing Step Assignment</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-blue-900">{category}</h3>
                <p className="text-sm text-blue-700">{subcategory}</p>
                <p className="text-xs text-blue-600 font-mono mt-1">{productCode}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{task.quantity}</div>
                <div className="text-xs text-blue-600">Original Pieces</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Order:</span>
                <p className="font-mono">{task.order_number}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Customer:</span>
                <p>{task.customer_name}</p>
              </div>
            </div>
          </div>

          {/* Current Step Output Summary */}
          {latestStep && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Received from {latestStep.step_name}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded border border-green-200">
                  <p className="text-sm text-green-600">Output Weight</p>
                  <p className="text-2xl font-bold text-green-800">{latestStep.output_weight || 0} kg</p>
                  {hasWeightLoss && (
                    <p className="text-xs text-orange-600 mt-1">
                      -{weightLossPercentage.toFixed(1)}% loss
                    </p>
                  )}
                </div>
                <div className="text-center p-3 bg-white rounded border border-green-200">
                  <p className="text-sm text-green-600">Output Quantity</p>
                  <p className="text-2xl font-bold text-green-800">{latestStep.output_quantity || 0} pcs</p>
                  {hasQuantityReduction && (
                    <p className="text-xs text-orange-600 mt-1">Reduced quantity</p>
                  )}
                </div>
              </div>

              {(hasQuantityReduction || hasWeightLoss) && (
                <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-orange-700">
                    Material loss detected from previous step
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manufacturing Timeline */}
          <div className="space-y-3">
            <Collapsible open={isTimelineExpanded} onOpenChange={setIsTimelineExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Manufacturing Timeline ({stepHistory.length} steps completed)
                  </div>
                  {isTimelineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-600">
                      <div>Step</div>
                      <div>Worker</div>
                      <div>Status</div>
                      <div>Input (kg)</div>
                      <div>Output (kg)</div>
                      <div>Quantity</div>
                      <div>Date</div>
                    </div>
                  </div>
                  
                  {stepHistory.map((step, index) => {
                    const loss = step.input_weight && step.output_weight ? calculateLossPercentage(step.input_weight, step.output_weight) : 0;
                    return (
                      <div key={index} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="grid grid-cols-7 gap-4 text-sm">
                          <div className="font-medium">{step.step_name}</div>
                          <div className="text-gray-600">{step.assigned_worker_name || '–'}</div>
                          <div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                              {step.status || 'Completed'}
                            </Badge>
                          </div>
                          <div>{step.input_weight || '–'}</div>
                          <div className="flex items-center gap-1">
                            {step.output_weight || '–'}
                            {loss > 0 && (
                              <span className="text-xs text-orange-600">(-{loss.toFixed(1)}%)</span>
                            )}
                          </div>
                          <div>{step.output_quantity || '–'} pcs</div>
                          <div className="text-xs text-gray-500">
                            {step.completed_date ? new Date(step.completed_date).toLocaleDateString() : '–'}
                          </div>
                        </div>
                        {step.remarks && (
                          <div className="mt-1 text-xs text-gray-500 italic">
                            {step.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Assignment Form */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-lg flex items-center gap-2 text-green-800">
              <User className="h-4 w-4" />
              Assign for {nextStepName}
            </h4>
            
            <div className="space-y-3">
              {/* Worker Selection */}
              <div>
                <Label className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  Select Worker *
                </Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a worker for this step" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map(worker => (
                      <SelectItem key={worker.id} value={worker.id}>
                        <div>
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.role || 'Worker'}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expected Delivery Date */}
              <div>
                <Label className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4" />
                  Expected Completion Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expectedDate}
                      onSelect={setExpectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Remarks */}
              <div>
                <Label className="font-medium">Special Instructions (Optional)</Label>
                <Textarea
                  placeholder="Add any special instructions for this step..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} className="flex-1">
              Assign & Move to {nextStepName}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
