
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProductionKanbanViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ProductionKanbanView = ({ manufacturingOrders, onViewDetails }: ProductionKanbanViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending');
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');
  const completedOrders = manufacturingOrders.filter(order => order.status === 'completed');

  const isOverdue = (order: any) => {
    if (!order.due_date) return false;
    return new Date() > new Date(order.due_date) && order.status !== 'completed';
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(order)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-sm">{order.order_number}</h4>
            <p className="text-gray-600 text-xs mt-1">{order.product_name}</p>
          </div>
          <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Package className="h-3 w-3" />
          <span>Qty: {order.quantity_required}</span>
        </div>

        {order.due_date && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue(order) ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverdue(order) ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            <span>
              {isOverdue(order) ? 'Overdue: ' : 'Due: '}
              {format(new Date(order.due_date), 'MMM dd')}
            </span>
          </div>
        )}

        {order.special_instructions && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
            <span className="font-medium">Note:</span> {order.special_instructions.substring(0, 50)}
            {order.special_instructions.length > 50 && '...'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({ 
    title, 
    orders, 
    bgColor, 
    icon: Icon 
  }: { 
    title: string; 
    orders: any[]; 
    bgColor: string; 
    icon: any;
  }) => (
    <div className="flex-1 min-w-0">
      <Card>
        <CardHeader className={`${bgColor} text-white`}>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
              {orders.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 min-h-96 max-h-96 overflow-y-auto">
          {orders.length > 0 ? (
            orders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          title="Pending"
          orders={pendingOrders}
          bgColor="bg-gray-600"
          icon={Clock}
        />
        <KanbanColumn
          title="In Progress"
          orders={inProgressOrders}
          bgColor="bg-blue-600"
          icon={Package}
        />
        <KanbanColumn
          title="Completed"
          orders={completedOrders}
          bgColor="bg-green-600"
          icon={Package}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{manufacturingOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {manufacturingOrders.filter(isOverdue).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium">Urgent Priority</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {manufacturingOrders.filter(order => order.priority === 'urgent').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-1">{inProgressOrders.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionKanbanView;
