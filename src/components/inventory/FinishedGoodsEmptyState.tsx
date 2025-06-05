
import { AlertCircle } from 'lucide-react';

interface FinishedGoodsEmptyStateProps {
  hasProducts: boolean;
  filteredCount: number;
}

const FinishedGoodsEmptyState = ({ hasProducts, filteredCount }: FinishedGoodsEmptyStateProps) => {
  if (filteredCount > 0) return null;

  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">
        {!hasProducts ? 'No finished goods found. Add some products to get started.' : 'No products found matching your search.'}
      </p>
    </div>
  );
};

export default FinishedGoodsEmptyState;
