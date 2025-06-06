
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Clock, TrendingUp, Bell, Check, Settings } from 'lucide-react';
import { useDailyInsights } from '@/hooks/useDailyInsights';

const DailyInsights = () => {
  const { insights, loading } = useDailyInsights();

  const getIcon = (iconName: string) => {
    const icons = {
      'alert-triangle': AlertTriangle,
      'package': Package,
      'clock': Clock,
      'trending-up': TrendingUp,
      'bell': Bell,
      'check': Check,
      'settings': Settings
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Bell;
    return IconComponent;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      case 'success': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => {
            const IconComponent = getIcon(insight.icon);
            return (
              <div 
                key={insight.id} 
                className={`p-3 rounded-lg border ${getTypeColor(insight.type)} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(insight.type)} className="ml-2 flex-shrink-0">
                    {insight.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyInsights;
