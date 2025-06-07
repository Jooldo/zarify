
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';

interface MaterialStatusBadgeProps {
  currentStock: number;
  minimumStock: number;
  className?: string;
}

const MaterialStatusBadge = ({ currentStock, minimumStock, className = "" }: MaterialStatusBadgeProps) => {
  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        label: 'Out of Stock',
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-600'
      };
    }
    if (currentStock <= minimumStock) {
      return {
        label: 'Low Stock',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-orange-600'
      };
    }
    return {
      label: 'In Stock',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-600'
    };
  };

  const status = getStockStatus();
  const Icon = status.icon;

  return (
    <Badge variant={status.variant} className={`text-xs flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {status.label}
    </Badge>
  );
};

export default MaterialStatusBadge;
