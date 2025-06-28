
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';

interface VoiceCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const VoiceCommandDialog: React.FC<VoiceCommandDialogProps> = ({
  open,
  onOpenChange,
  onOrderCreated
}) => {
  const {
    isRecording,
    isProcessing,
    transcription,
    parsedCommand,
    startRecording,
    stopRecording,
    clearCommand,
    canRecord
  } = useVoiceCommands();

  const { submitOrder, loading: isSubmitting } = useOrderSubmission({
    onOrderCreated,
    onClose: () => onOpenChange(false)
  });

  const [editedCommand, setEditedCommand] = useState({
    customerName: '',
    productCode: '',
    quantity: 1,
    deliveryDate: '',
    price: ''
  });

  // Update edited command when parsed command changes
  React.useEffect(() => {
    if (parsedCommand) {
      setEditedCommand({
        customerName: parsedCommand.customerName || '',
        productCode: parsedCommand.productCode || '',
        quantity: parsedCommand.quantity || 1,
        deliveryDate: parsedCommand.deliveryDate || '',
        price: '' // Price will be entered manually
      });
    }
  }, [parsedCommand]);

  const handleSubmitOrder = async () => {
    if (!editedCommand.customerName || !editedCommand.productCode || !editedCommand.quantity) {
      return;
    }

    const orderItems = [{
      productCode: editedCommand.productCode,
      quantity: editedCommand.quantity,
      price: parseFloat(editedCommand.price) || 0
    }];

    await submitOrder(
      editedCommand.customerName,
      '', // phone - can be empty
      orderItems,
      editedCommand.deliveryDate || undefined
    );
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClose = () => {
    clearCommand();
    onOpenChange(false);
  };

  if (!canRecord) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Commands Not Available
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Voice commands require microphone access. Please ensure your browser supports audio recording.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Command Order Creation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recording Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className="w-32 h-12"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="animate-pulse flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">Recording...</span>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600">Processing speech...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcription Section */}
          {transcription && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm italic">"{transcription}"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parsed Command Section */}
          {parsedCommand && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Parsed Command
                  <Badge className={getConfidenceBadgeColor(parsedCommand.confidence)}>
                    {parsedCommand.confidence} confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="customerName" className="text-xs">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={editedCommand.customerName}
                      onChange={(e) => setEditedCommand(prev => ({ ...prev, customerName: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productCode" className="text-xs">Product Code</Label>
                    <Input
                      id="productCode"
                      value={editedCommand.productCode}
                      onChange={(e) => setEditedCommand(prev => ({ ...prev, productCode: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-xs">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={editedCommand.quantity}
                      onChange={(e) => setEditedCommand(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-xs">Unit Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={editedCommand.price}
                      onChange={(e) => setEditedCommand(prev => ({ ...prev, price: e.target.value }))}
                      className="h-8 text-xs"
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="deliveryDate" className="text-xs">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={editedCommand.deliveryDate}
                      onChange={(e) => setEditedCommand(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Parsing Status */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${parsedCommand.parsedElements.foundProduct ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Product
                  </div>
                  <div className={`flex items-center gap-1 ${parsedCommand.parsedElements.foundQuantity ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Quantity
                  </div>
                  <div className={`flex items-center gap-1 ${parsedCommand.parsedElements.foundCustomer ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Customer
                  </div>
                  <div className={`flex items-center gap-1 ${parsedCommand.parsedElements.foundDate ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckCircle className="h-3 w-3" />
                    Date
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} size="sm">
              Cancel
            </Button>
            {transcription && (
              <Button variant="outline" onClick={clearCommand} size="sm">
                Clear
              </Button>
            )}
            {parsedCommand && (
              <Button 
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !editedCommand.customerName || !editedCommand.productCode || !editedCommand.price}
                size="sm"
              >
                {isSubmitting ? 'Creating Order...' : 'Create Order'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCommandDialog;
