
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package2, 
  Clock, 
  CheckCircle, 
  GitBranch,
  Users,
  Plus,
  Table,
  Kanban,
  Calendar,
  Eye
} from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useWorkers } from '@/hooks/useWorkers';

interface ManufacturingOverviewProps {
  onNavigate: (section: string) => void;
}

const ManufacturingOverview: React.FC<ManufacturingOverviewProps> = ({ onNavigate }) => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { workers } = useWorkers();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalOrders = manufacturingOrders.length;
  const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending').length;
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress').length;
  const completedOrders = manufacturingOrders.filter(order => order.status === 'completed').length;
  const totalWorkers = workers.length;

  const actionCards = [
    {
      title: 'Worker Management',
      description: 'Manage workers and their assignments',
      icon: Users,
      action: () => onNavigate('workers'),
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Create Manufacturing Order',
      description: 'Start a new production order',
      icon: Plus,
      action: () => onNavigate('create-order'),
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'View Orders',
      description: 'Browse all manufacturing orders',
      icon: Table,
      action: () => onNavigate('orders-table'),
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Production Queue',
      description: 'Monitor production workflow',
      icon: Eye,
      action: () => onNavigate('production-queue'),
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Kanban View',
      description: 'Visual task management board',
      icon: Kanban,
      action: () => onNavigate('kanban'),
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Gantt View',
      description: 'Timeline and scheduling view',
      icon: Calendar,
      action: () => onNavigate('gantt'),
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manufacturing Overview</h1>
        <p className="text-muted-foreground">
          Manage production orders, track progress, and coordinate manufacturing activities
        </p>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-blue-800">Total Orders</CardTitle>
            <div className="p-1.5 bg-blue-200 rounded-full">
              <Package2 className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
            <p className="text-xs text-blue-700 mt-0.5">All manufacturing orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gray-50 border-gray-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-800">Pending</CardTitle>
            <div className="p-1.5 bg-gray-200 rounded-full">
              <Clock className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
            <p className="text-xs text-gray-700 mt-0.5">Awaiting production</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-orange-800">In Progress</CardTitle>
            <div className="p-1.5 bg-orange-200 rounded-full">
              <GitBranch className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-orange-900">{inProgressOrders}</div>
            <p className="text-xs text-orange-700 mt-0.5">Currently being manufactured</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-green-800">Completed</CardTitle>
            <div className="p-1.5 bg-green-200 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-green-900">{completedOrders}</div>
            <p className="text-xs text-green-700 mt-0.5">Finished production</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-violet-50 border-violet-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-violet-800">Workers</CardTitle>
            <div className="p-1.5 bg-violet-200 rounded-full">
              <Users className="h-4 w-4 text-violet-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-violet-900">{totalWorkers}</div>
            <p className="text-xs text-violet-700 mt-0.5">Available workers</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Manufacturing Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${card.color} border-2`}
              onClick={card.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-white/50 ${card.iconColor}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManufacturingOverview;
