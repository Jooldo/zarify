
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  User, 
  Package, 
  Wrench,
  ShoppingCart,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface TodaysActivitiesSectionProps {
  logs: any[];
  loading: boolean;
  todayString: string;
}

const TodaysActivitiesSection = ({ logs, loading, todayString }: TodaysActivitiesSectionProps) => {
  const todaysActivities = useMemo(() => {
    if (!logs.length) return [];
    
    return logs
      .filter(log => {
        const logDate = format(new Date(log.timestamp), 'yyyy-MM-dd');
        return logDate === todayString;
      })
      .slice(0, 10); // Show latest 10 activities
  }, [logs, todayString]);

  const getActivityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'manufacturing':
      case 'manufacturing_order':
        return Wrench;
      case 'inventory':
      case 'finished_goods':
        return Package;
      case 'procurement':
        return ShoppingCart;
      case 'user':
        return User;
      default:
        return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    if (action.includes('create') || action.includes('start')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('complete') || action.includes('deliver')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('update') || action.includes('modify')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (action.includes('delete') || action.includes('cancel')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Today's Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Today's Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {todaysActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No activities today</p>
              <p className="text-sm">Activities will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysActivities.map((activity) => {
                const Icon = getActivityIcon(activity.entity_type);
                return (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm border">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getActivityColor(activity.action)} border`}
                            >
                              {activity.entity_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              by {activity.user_name}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.timestamp), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodaysActivitiesSection;
