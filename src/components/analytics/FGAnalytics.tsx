
import { BarChart3, TrendingUp, TrendingDown, Factory, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FGAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Manufacturing Analytics
        </h3>
        <p className="text-muted-foreground">
          Track production efficiency, costs, and performance metrics for finished goods manufacturing.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Production Efficiency
              </CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">87.3%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Production Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">2.3 hrs</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.2 hrs improvement
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Production Cost per Unit
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">₹245</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +₹12 from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quality Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">96.8%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1.2% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Production Trends
          </h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Daily Production Volume</h5>
              <p className="text-sm text-muted-foreground">
                Track daily production output and identify peak performance periods.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Monthly Efficiency Trends</h5>
              <p className="text-sm text-muted-foreground">
                Monitor manufacturing efficiency changes over time.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Seasonal Analysis</h5>
              <p className="text-sm text-muted-foreground">
                Analyze production patterns across different seasons.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Analysis
          </h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Labor Cost Breakdown</h5>
              <p className="text-sm text-muted-foreground">
                Analyze labor costs per product and identify optimization opportunities.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Material Cost Tracking</h5>
              <p className="text-sm text-muted-foreground">
                Monitor raw material costs and their impact on production.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Overhead Cost Analysis</h5>
              <p className="text-sm text-muted-foreground">
                Track facility and equipment costs per manufacturing unit.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Performance Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-2">Bottleneck Analysis</h5>
            <p className="text-sm text-muted-foreground">
              Identify production bottlenecks and capacity constraints.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-2">Worker Productivity</h5>
            <p className="text-sm text-muted-foreground">
              Analyze individual and team productivity metrics.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-2">Equipment Utilization</h5>
            <p className="text-sm text-muted-foreground">
              Monitor machine utilization and maintenance schedules.
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📊 Advanced analytics dashboard with interactive charts and real-time data coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FGAnalytics;
