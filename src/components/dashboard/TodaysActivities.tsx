
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  description: string;
  created_at: string;
  user_name: string;
}

const TodaysActivities = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysActivities = async () => {
      try {
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) throw merchantError;

        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('merchant_id', merchantId)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysActivities();
  }, []);

  const getActivityIcon = (action: string, entityType: string) => {
    if (action.includes('Status')) return '🔁';
    if (action.includes('Stock')) return '📦';
    if (entityType === 'Procurement Request') return '🧾';
    if (entityType === 'Order') return '🛒';
    return '📝';
  };

  const getActivityColor = (action: string) => {
    if (action.includes('Created')) return 'border-l-green-400 bg-green-50';
    if (action.includes('Updated') || action.includes('Status')) return 'border-l-blue-400 bg-blue-50';
    if (action.includes('Stock')) return 'border-l-purple-400 bg-purple-50';
    return 'border-l-gray-400 bg-gray-50';
  };

  if (loading) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-500">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-green-500" />
          Today's Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-44">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No activities today
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-2 rounded border-l-2 ${getActivityColor(activity.action)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">
                      {getActivityIcon(activity.action, activity.entity_type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {activity.action} - {activity.entity_type}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 leading-tight">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(activity.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodaysActivities;
