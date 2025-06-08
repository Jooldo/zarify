
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const FilterDialog = ({
  isOpen,
  onOpenChange,
  title,
  children,
  onApplyFilters,
  onClearFilters,
  activeFilterCount
}: FilterDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {children}
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={onApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={onClearFilters} className="flex-1">
            Clear Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
