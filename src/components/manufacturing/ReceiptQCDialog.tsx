
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  worker_name: string;
  delivery_date: string;
  materials: {
    name: string;
    allocated_weight: number;
    unit: string;
  }[];
}

interface ReceiptQCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  stepNumber: number;
  stepName: string;
  onReceiptComplete: (qcData: any) => void;
}

const ReceiptQCDialog = ({
  open,
  onOpenChange,
  assignment,
  stepNumber,
  stepName,
  onReceiptComplete
}: ReceiptQCDialogProps) => {
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [receivedPieces, setReceivedPieces] = useState<number>(0);
  const [qcPassedPieces, setQcPassedPieces] = useState<number>(0);
  const [qcFailedPieces, setQcFailedPieces] = useState<number>(0);
  const [qcPassedWeight, setQcPassedWeight] = useState<number>(0);
  const [qcFailedWeight, setQcFailedWeight] = useState<number>(0);
  const [qcNotes, setQcNotes] = useState('');
  const { toast } = useToast();

  const handleReceiptConfirmation = () => {
    // Validation
    if (receivedWeight <= 0 || receivedPieces <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter valid received weight and pieces.',
        variant: 'destructive',
      });
      return;
    }

    if (qcPassedPieces + qcFailedPieces !== receivedPieces) {
      toast({
        title: 'QC Mismatch',
        description: 'QC passed + failed pieces must equal received pieces.',
        variant: 'destructive',
      });
      return;
    }

    if (Math.abs((qcPassedWeight + qcFailedWeight) - receivedWeight) > 0.01) {
      toast({
        title: 'Weight Mismatch',
        description: 'QC passed + failed weight must equal received weight.',
        variant: 'destructive',
      });
      return;
    }

    const qcData = {
      assignment_id: assignment?.id,
      received_weight: receivedWeight,
      received_pieces: receivedPieces,
      qc_passed_pieces: qcPassedPieces,
      qc_failed_pieces: qcFailedPieces,
      qc_passed_weight: qcPassedWeight,
      qc_failed_weight: qcFailedWeight,
      notes: qcNotes
    };

    console.log('QC Data:', qcData);

    toast({
      title: 'Receipt & QC Completed',
      description: `Step ${stepNumber} receipt confirmed with ${qcPassedPieces} pieces passed and ${qcFailedPieces} pieces failed.`,
    });

    onReceiptComplete(qcData);
    onOpenChange(false);
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Receipt & QC - Step {stepNumber}: {stepName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Assignment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Worker:</span> {assignment.worker_name}
              </div>
              <div>
                <span className="font-medium">Delivery Date:</span> {assignment.delivery_date}
              </div>
            </div>
            
            <div className="mt-3">
              <span className="font-medium text-sm">Allocated Materials:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {assignment.materials.map((material, index) => (
                  <Badge key={index} variant="outline">
                    {material.name}: {material.allocated_weight} {material.unit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Receipt Section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Receipt Confirmation
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Received Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={receivedWeight}
                  onChange={(e) => setReceivedWeight(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Received Pieces</Label>
                <Input
                  type="number"
                  value={receivedPieces}
                  onChange={(e) => setReceivedPieces(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* QC Section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Quality Control
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              {/* QC Passed */}
              <div className="space-y-3">
                <Label className="text-green-600 font-medium">QC Passed</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm">Pieces</Label>
                    <Input
                      type="number"
                      value={qcPassedPieces}
                      onChange={(e) => setQcPassedPieces(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      max={receivedPieces}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={qcPassedWeight}
                      onChange={(e) => setQcPassedWeight(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      max={receivedWeight}
                    />
                  </div>
                </div>
              </div>

              {/* QC Failed */}
              <div className="space-y-3">
                <Label className="text-red-600 font-medium">QC Failed</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm">Pieces</Label>
                    <Input
                      type="number"
                      value={qcFailedPieces}
                      onChange={(e) => setQcFailedPieces(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      max={receivedPieces}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={qcFailedWeight}
                      onChange={(e) => setQcFailedWeight(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      max={receivedWeight}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="mt-4 p-3 bg-muted/30 rounded text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Pieces Check:</span>{' '}
                  <span className={qcPassedPieces + qcFailedPieces === receivedPieces ? 'text-green-600' : 'text-red-600'}>
                    {qcPassedPieces + qcFailedPieces} / {receivedPieces}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Weight Check:</span>{' '}
                  <span className={Math.abs((qcPassedWeight + qcFailedWeight) - receivedWeight) <= 0.01 ? 'text-green-600' : 'text-red-600'}>
                    {(qcPassedWeight + qcFailedWeight).toFixed(2)} / {receivedWeight.toFixed(2)} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QC Notes */}
          <div>
            <Label>QC Notes (Optional)</Label>
            <Textarea
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="Any quality issues, observations, or additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleReceiptConfirmation}>
              Confirm Receipt & QC
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptQCDialog;
