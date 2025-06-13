
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, AlertTriangle } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

interface ProductionGanttViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ProductionGanttView = ({ manufacturingOrders, onViewDetails }: ProductionGanttViewProps) => {
  const today = startOfDay(new Date());
  const timelineStart = today;
  const timelineEnd = addDays(today, 30);
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOrderPosition = (order: any) => {
    const createdDate = new Date(order.created_at);
    const dueDate = order.due_date ? new Date(order.due_date) : addDays(createdDate, 7);
    
    const startPos = Math.max(0, Math.floor((createdDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));
    const endPos = Math.min(30, Math.floor((dueDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      left: `${(startPos / 30) * 100}%`,
      width: `${Math.max(1, (endPos - startPos) / 30) * 100}%`,
      isOverdue: order.due_date && isAfter(today, new Date(order.due_date)) && order.status !== 'completed'
    };
  };

  const generateTimelineLabels = () => {
    const labels = [];
    for (let i = 0; i <= 30; i += 5) {
      const date = addDays(timelineStart, i);
      labels.push(
        <div key={i} className="text-xs text-gray-500 text-center" style={{ left: `${(i / 30) * 100}%` }}>
          {format(date, 'MMM dd')}
        </div>
      );
    }
    return labels;
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Production Timeline (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-8 bg-gray-50 rounded mb-4">
            <div className="absolute inset-0 flex">
              {Array.from({ length: 31 }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r border-gray-200 ${i === 0 ? 'bg-blue-50' : ''}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center">
              {generateTimelineLabels()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <div className="space-y-2">
        {manufacturingOrders.map((order) => {
          const position = getOrderPosition(order);
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`} />
                      <span className="font-medium">{order.order_number}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    {position.isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => onViewDetails(order)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.product_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Qty: {order.quantity_required}</span>
                      {order.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {format(new Date(order.due_date), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 h-full rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-500' 
                        : order.status === 'in_progress'
                        ? 'bg-blue-500'
                        : position.isOverdue
                        ? 'bg-red-500'
                        : getPriorityColor(order.priority)
                    } opacity-80`}
                    style={{
                      left: position.left,
                      width: position.width,
                    }}
                  />
                  
                  {/* Progress indicator for in-progress orders */}
                  {order.status === 'in_progress' && (
                    <div
                      className="absolute top-0 h-full bg-green-400 rounded-full"
                      style={{
                        left: position.left,
                        width: `${(parseFloat(position.width) * 0.3)}%`, // Assuming 30% progress
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {manufacturingOrders.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No manufacturing orders to display in timeline</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionGanttView;
