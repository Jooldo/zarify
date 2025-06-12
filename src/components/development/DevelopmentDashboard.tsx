
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database } from 'lucide-react';
import WorkerSeeder from './WorkerSeeder';

const DevelopmentDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Development Tools</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkerSeeder />
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Info
            </CardTitle>
            <CardDescription>
              Quick access to development tools and data seeding utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Use the Worker Seeder to populate your database with test data for manufacturing workflows.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevelopmentDashboard;
