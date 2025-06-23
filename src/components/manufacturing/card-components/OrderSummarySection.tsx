
import React from 'react';
import { Package } from 'lucide-react';
import { StepCardData } from '../ManufacturingStepCard';

interface OrderSummarySectionProps {
  data: StepCardData;
  isOrderCard: boolean;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({ data, isOrderCard }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 truncate">{data.orderNumber}</div>
          <div className="text-xs text-gray-600 truncate">{data.productCode || data.productName}</div>
        </div>
        {isOrderCard && data.quantityRequired && (
          <div className="text-sm font-semibold text-gray-700 flex-shrink-0 bg-blue-50 px-2 py-1 rounded">
            Qty: {data.quantityRequired}
          </div>
        )}
      </div>

      {/* Progress bar for non-order cards */}
      {!isOrderCard && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderSummarySection;
