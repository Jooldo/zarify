
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Printer, Scan } from 'lucide-react';
import { useState } from 'react';
import TagPrintDialog from './TagPrintDialog';
import TagScanInterface from './TagScanInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FinishedGoodsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onTagOperationComplete?: () => void;
}

const FinishedGoodsHeader = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  onTagOperationComplete
}: FinishedGoodsHeaderProps) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);

  const handleTagGenerated = () => {
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
      
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPrintDialogOpen(true)}
            className="h-8"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print Tag
          </Button>
          
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tag Scanner</DialogTitle>
              </DialogHeader>
              <TagScanInterface onOperationComplete={handleScanComplete} />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="h-8"
          >
            Refresh
          </Button>
        </div>
      </div>

      <TagPrintDialog
        isOpen={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        onTagGenerated={handleTagGenerated}
      />
    </div>
  );
};

export default FinishedGoodsHeader;
