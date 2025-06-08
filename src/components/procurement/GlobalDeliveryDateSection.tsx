
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GlobalDeliveryDateSectionProps {
  useGlobalDeliveryDate: boolean;
  setUseGlobalDeliveryDate: (value: boolean) => void;
  globalDeliveryDate: string;
  setGlobalDeliveryDate: (value: string) => void;
}

const GlobalDeliveryDateSection = ({
  useGlobalDeliveryDate,
  setUseGlobalDeliveryDate,
  globalDeliveryDate,
  setGlobalDeliveryDate
}: GlobalDeliveryDateSectionProps) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useGlobalDeliveryDate"
          checked={useGlobalDeliveryDate}
          onChange={(e) => setUseGlobalDeliveryDate(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="useGlobalDeliveryDate">Use same delivery date for all items</Label>
      </div>
      
      {useGlobalDeliveryDate && (
        <div>
          <Label htmlFor="globalDeliveryDate">Expected Delivery Date (All Items)</Label>
          <Input
            id="globalDeliveryDate"
            type="date"
            value={globalDeliveryDate}
            onChange={(e) => setGlobalDeliveryDate(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default GlobalDeliveryDateSection;
