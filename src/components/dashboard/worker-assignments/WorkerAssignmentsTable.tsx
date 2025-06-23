
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Package, Weight } from 'lucide-react';
import { WorkerAssignment } from './types';

interface WorkerAssignmentsTableProps {
  assignments: WorkerAssignment[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const WorkerAssignmentsTable = ({ assignments }: WorkerAssignmentsTableProps) => {
  return (
    <div className="border rounded-lg bg-white/80 backdrop-blur-sm shadow-lg">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Worker</TableHead>
              <TableHead className="font-semibold">Steps Working On</TableHead>
              <TableHead className="font-semibold text-center">Total Quantity</TableHead>
              <TableHead className="font-semibold text-center">Total Weight</TableHead>
              <TableHead className="font-semibold text-center">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.workerId} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                        {assignment.workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-800">{assignment.workerName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {assignment.steps.map((step, index) => (
                      <div key={`${step.stepName}-${index}`} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{step.stepName}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {assignment.totalQuantity > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-emerald-700">{assignment.totalQuantity}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {assignment.totalWeight > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <Weight className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-700">{assignment.totalWeight.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    {assignment.orderCount}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default WorkerAssignmentsTable;
