
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Calendar } from 'lucide-react';
import { useUserActivityLog } from '@/hooks/useUserActivityLog';
import { format } from 'date-fns';

const TodaysActivitiesSection = () => {
  const { activities, isLoading } = useUserActivityLog();

  const todaysActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  }).slice(0, 10);

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'order':
        return '📦';
      case 'product':
        return '🏷️';
      case 'customer':
        return '👤';
      case 'invoice':
        return '📄';
      case 'raw material':
        return '🧱';
      case 'finished good':
        return '✅';
      case 'supplier':
        return '🏭';
      case 'procurement':
        return '📋';
      case 'tag':
        return '🏷️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'tagged':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Today's Activities
          <Badge variant="outline" className="ml-auto">
            {todaysActivities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaysActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activities recorded today</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {todaysActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="text-xl">{getEntityIcon(activity.entity_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActionColor(activity.action)}`}
                      >
                        {activity.action}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.user_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysActivitiesSection;
