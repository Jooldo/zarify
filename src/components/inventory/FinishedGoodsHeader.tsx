
import { Button } from '@/components/ui/button';
import { Package, Printer, Scan, QrCode } from 'lucide-react'; // Added QrCode for consistency with TagPrintForm
import { useState } from 'react';
// Removed TagPrintDialog import
import TagScanInterface from './TagScanInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TagPrintForm from './TagPrintForm'; // Added import for TagPrintForm

interface FinishedGoodsHeaderProps {
  onRefresh: () => void;
  onTagOperationComplete?: () => void;
}

const FinishedGoodsHeader = ({
  onRefresh,
  onTagOperationComplete
}: FinishedGoodsHeaderProps) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);

  const handleTagGenerated = () => {
    setIsPrintDialogOpen(false); // Close dialog on successful generation
    if (onTagOperationComplete) onTagOperationComplete();
  };

  const handleScanComplete = () => {
    setIsScanDialogOpen(false);
    if (onTagOperationComplete) onTagOperationComplete();
  };

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5" />
        Finished Goods Inventory
      </h3>
      
      <div className="flex gap-2">
        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> {/* Using QrCode icon like in TagPrintForm */}
                Generate & Print Tag
              </DialogTitle>
            </DialogHeader>
            <TagPrintForm onTagGenerated={handleTagGenerated} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
            >
              <Scan className="h-4 w-4 mr-1" />
              Scan Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]"> {/* Ensure consistent styling */}
            <DialogHeader>
              <DialogTitle>Tag Scanner</DialogTitle>
            </DialogHeader>
            <TagScanInterface onOperationComplete={handleScanComplete} />
          </DialogContent>
        </Dialog>
      </div>

      {/* TagPrintDialog component is no longer used here */}
    </div>
  );
};

export default FinishedGoodsHeader;

