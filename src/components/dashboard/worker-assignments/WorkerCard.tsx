
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Package, Weight, MapPin } from 'lucide-react';
import { WorkerAssignment } from './types';

interface WorkerCardProps {
  assignment: WorkerAssignment;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const WorkerCard = ({ assignment }: WorkerCardProps) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {assignment.workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{assignment.workerName}</p>
            <p className="text-xs text-gray-500 font-normal">
              {assignment.orderCount} order{assignment.orderCount !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2">
          {assignment.totalQuantity > 0 && (
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Total Qty</span>
              </div>
              <span className="text-sm font-bold text-emerald-800">
                {assignment.totalQuantity}
              </span>
            </div>
          )}
          
          {assignment.totalWeight > 0 && (
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Total Wt</span>
              </div>
              <span className="text-sm font-bold text-orange-800">
                {assignment.totalWeight.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Current Steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            <span>Working On:</span>
          </div>
          
          {assignment.steps.map((step, index) => (
            <div key={`${step.stepName}-${index}`} className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{step.stepName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.stepOrder}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                    {step.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {step.quantity > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    {step.quantity} {step.quantityUnit || 'pcs'}
                  </span>
                )}
                {step.weight > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {step.weight.toFixed(2)} {step.weightUnit || 'kg'}
                  </span>
                )}
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {step.orderIds.length} order{step.orderIds.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkerCard;
