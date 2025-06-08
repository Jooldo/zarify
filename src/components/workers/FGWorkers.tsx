
import { Users, Clock, Award, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FGWorkers = () => {
  return (
    <div className="space-y-6">
      {/* Workers Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manufacturing Workforce
        </h3>
        <p className="text-muted-foreground">
          Manage manufacturing workers, track performance, and optimize workforce allocation.
        </p>
      </div>

      {/* Workers Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Workers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 this month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present Today
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">22</div>
            <div className="text-xs text-muted-foreground">
              91.7% attendance
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Productivity
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">85.4%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3.2% this week
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Hours/Week
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">42.5</div>
            <div className="text-xs text-muted-foreground">
              Standard: 40 hrs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Shift Management
          </h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Morning Shift (6 AM - 2 PM)</h5>
              <p className="text-sm text-muted-foreground mb-2">12 workers assigned</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productivity: 88%</span>
                <span className="text-xs text-green-600">On track</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Evening Shift (2 PM - 10 PM)</h5>
              <p className="text-sm text-muted-foreground mb-2">10 workers assigned</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productivity: 82%</span>
                <span className="text-xs text-yellow-600">Below target</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Night Shift (10 PM - 6 AM)</h5>
              <p className="text-sm text-muted-foreground mb-2">8 workers assigned</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productivity: 75%</span>
                <span className="text-xs text-red-600">Needs attention</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Tracking
          </h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Top Performers</h5>
              <p className="text-sm text-muted-foreground">
                Recognize and reward high-performing workers this month.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Training Needs</h5>
              <p className="text-sm text-muted-foreground">
                Identify workers who need additional training or support.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Attendance Tracking</h5>
              <p className="text-sm text-muted-foreground">
                Monitor attendance patterns and manage leave requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Workforce Management
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium">Worker Profiles</h5>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Manage worker information, skills, and certifications.
            </p>
            <div className="text-sm font-medium text-blue-600">
              Manage Profiles →
            </div>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-green-600" />
              <h5 className="font-medium">Time Tracking</h5>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Track working hours, breaks, and overtime management.
            </p>
            <div className="text-sm font-medium text-green-600">
              View Timesheets →
            </div>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h5 className="font-medium">Scheduling</h5>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Create and manage work schedules and shift assignments.
            </p>
            <div className="text-sm font-medium text-purple-600">
              Manage Schedule →
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            👥 Advanced workforce management features including payroll integration and performance analytics coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FGWorkers;
