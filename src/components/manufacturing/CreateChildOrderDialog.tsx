
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder?: any;
}

const CreateChildOrderDialog: React.FC<CreateChildOrderDialogProps> = ({
  isOpen,
  onClose,
  parentOrder
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Child Order</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-muted-foreground">
            Child order functionality is being restructured. Please check back later.
          </p>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
