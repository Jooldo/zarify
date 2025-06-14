
export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent': return 'border-red-200 bg-red-100 text-red-800';
    case 'high': return 'border-orange-200 bg-orange-100 text-orange-800';
    case 'medium': return 'border-yellow-200 bg-yellow-100 text-yellow-800';
    case 'low': return 'border-green-200 bg-green-100 text-green-800';
    default: return 'border-gray-200 bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
