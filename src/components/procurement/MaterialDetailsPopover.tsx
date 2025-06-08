
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface MaterialDetail {
  name: string;
  type: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface MaterialDetailsPopoverProps {
  children: React.ReactNode;
  materials: MaterialDetail[];
}

const MaterialDetailsPopover = ({ children, materials }: MaterialDetailsPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-80 overflow-y-auto" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">Materials in this Request</h4>
          {materials.map((material, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{material.name}</span>
                <Badge variant="outline" className="text-xs">
                  {material.type}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Quantity: {material.quantity} {material.unit}
              </div>
              {material.notes && (
                <div className="text-xs text-gray-500 mt-1">
                  Notes: {material.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MaterialDetailsPopover;
