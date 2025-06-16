
import UnifiedDashboard from './UnifiedDashboard';
import { OrderFilters } from '@/components/OrdersTab';

interface VisualDashboardProps {
  onNavigateToTab?: (tab: string, filters?: Partial<OrderFilters>) => void;
}

const VisualDashboard = ({ onNavigateToTab }: VisualDashboardProps) => {
  return <UnifiedDashboard />;
};

export default VisualDashboard;
