
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, User, Clock, Warehouse, Weight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ProductionTask {
  id: string;
  productCode: string;
  category: string;
  subcategory: string;
  quantity: number;
  orderNumber: string;
  customerName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt?: Date;
  expectedDate?: Date;
  rawMaterials?: Array<{
    name: string;
    unit: string;
    requiredQty: number;
    currentStock?: number;
  }>;
}

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

// Mock workers data
const mockWorkers = [
  { id: '1', name: 'Rajesh Kumar', specialization: 'Jalhai Expert' },
  { id: '2', name: 'Suresh Patel', specialization: 'General Worker' },
  { id: '3', name: 'Anil Sharma', specialization: 'Senior Operator' },
  { id: '4', name: 'Vinod Singh', specialization: 'Jalhai Specialist' },
];

// Mock raw materials for demonstration
const mockRawMaterials = [
  { name: 'Cement', unit: 'kg', requiredQty: 25, currentStock: 150 },
  { name: 'Steel Bars', unit: 'pcs', requiredQty: 8, currentStock: 12 },
  { name: 'Sand', unit: 'kg', requiredQty: 40, currentStock: 200 },
];

const getStockStatus = (required: number, current: number) => {
  if (current >= required) return 'sufficient';
  if (current >= required * 0.5) return 'low';
  return 'critical';
};

const getStockColor = (status: string) => {
  switch (status) {
    case 'sufficient': return 'text-green-600 bg-green-50';
    case 'low': return 'text-yellow-600 bg-yellow-50';
    case 'critical': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const AssignmentDialog = ({ open, onOpenChange, task, onAssign }: AssignmentDialogProps) => {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  // Set default expected date to 3 days from now
  useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    setExpectedDate(defaultDate);
  });

  // Calculate total weight of raw materials
  const calculateTotalWeight = () => {
    return mockRawMaterials.reduce((total, material) => {
      // Assuming weight per unit (mock data)
      const weightPerUnit = material.name === 'Cement' ? 1 : // 1 kg per kg
                           material.name === 'Steel Bars' ? 0.5 : // 0.5 kg per piece
                           material.name === 'Sand' ? 1 : 0; // 1 kg per kg
      return total + (material.requiredQty * weightPerUnit);
    }, 0);
  };

  const totalWeight = calculateTotalWeight();

  const handleAssign = () => {
    if (!task) return;

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

    const worker = mockWorkers.find(w => w.id === selectedWorker);
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
      description: 'Task assigned and moved to Jalhai',
    });
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign Task to Jalhai
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Card Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-blue-900">{task.category}</h3>
                <p className="text-sm text-blue-700">{task.subcategory}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{task.quantity} pcs</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Product Code:</span>
                <p className="font-mono">{task.productCode}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Created:</span>
                <p>{task.createdAt?.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Total Weight Summary */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="h-5 w-5 text-orange-600" />
              <Label className="font-semibold text-orange-800">Total Raw Materials Weight</Label>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {totalWeight.toFixed(2)} kg
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Combined weight of all required raw materials
            </p>
          </div>

          {/* Raw Materials Required */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-gray-600" />
              <Label className="font-semibold">Raw Materials Required</Label>
            </div>
            
            <div className="space-y-2">
              {mockRawMaterials.map((material, index) => {
                const status = getStockStatus(material.requiredQty, material.currentStock);
                const weightPerUnit = material.name === 'Cement' ? 1 : 
                                     material.name === 'Steel Bars' ? 0.5 : 
                                     material.name === 'Sand' ? 1 : 0;
                const materialWeight = material.requiredQty * weightPerUnit;
                
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium">{material.name}</span>
                          <div className="text-sm text-gray-600">
                            Required: {material.requiredQty} {material.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Weight: {materialWeight.toFixed(2)} kg
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStockColor(status)}`}>
                        Stock: {material.currentStock} {material.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4" />
              Assign Worker *
            </Label>
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="Select a worker" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkers.map(worker => (
                  <SelectItem key={worker.id} value={worker.id}>
                    <div>
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-xs text-gray-500">{worker.specialization}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expected Delivery Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4" />
              Expected Delivery Date *
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
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label className="font-semibold">Remarks (Optional)</Label>
            <Textarea
              placeholder="Add any special instructions or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
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
              Assign & Move to Jalhai
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
