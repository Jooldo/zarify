
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import { useState } from 'react';
import TagPrintTemplate from './TagPrintTemplate';

interface TagPrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Array<{
    tag_id: string;
    product_code: string;
    quantity: number;
    qr_code_data: string;
    category?: string;
    subcategory?: string;
  }>;
}

const TagPrintPreviewDialog = ({ isOpen, onOpenChange, tags }: TagPrintPreviewDialogProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePrint = () => {
    setIsPreviewMode(true);
    setTimeout(() => {
      window.print();
      setIsPreviewMode(false);
    }, 100);
  };

  const handleClose = () => {
    setIsPreviewMode(false);
    onOpenChange(false);
  };

  if (isPreviewMode) {
    return <TagPrintTemplate tags={tags} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Print Preview - {tags.length} Tag{tags.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Print Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure your printer is connected and ready</li>
              <li>• Use standard label paper or regular paper</li>
              <li>• Check print settings for proper scaling</li>
              <li>• Each tag contains a QR code for scanning</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <h3 className="font-medium mb-3">Preview:</h3>
            <div className="grid grid-cols-2 gap-4">
              {tags.map((tag) => (
                <div key={tag.tag_id} className="border border-gray-300 p-3 bg-white rounded">
                  <div className="text-center">
                    <div className="font-bold text-lg">{tag.tag_id}</div>
                    <div className="text-sm text-gray-600">{tag.product_code}</div>
                    <div className="my-2 flex justify-center">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                        QR Code
                      </div>
                    </div>
                    <div className="text-xs font-medium">Qty: {tag.quantity}</div>
                    {(tag.category || tag.subcategory) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {tag.category} - {tag.subcategory}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Tags
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagPrintPreviewDialog;
