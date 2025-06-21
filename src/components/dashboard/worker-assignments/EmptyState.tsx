
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

const EmptyState = () => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Worker Assignments</h3>
        <p className="text-gray-600">There are currently no workers assigned to manufacturing steps.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
