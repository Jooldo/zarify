
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDummyWorkers, clearAllWorkers } from '@/utils/seedWorkers';
import { Database, Trash2, Users } from 'lucide-react';

const WorkerSeeder: React.FC = () => {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSeedWorkers = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDummyWorkers();
      
      if (result.success) {
        toast({
          title: 'Workers Seeded Successfully',
          description: result.count 
            ? `Added ${result.count} dummy workers to the database`
            : result.message || 'Workers already exist',
        });
      } else {
        toast({
          title: 'Error Seeding Workers',
          description: 'Failed to add dummy workers. Check console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during seeding:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while seeding workers.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearWorkers = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllWorkers();
      
      if (result.success) {
        toast({
          title: 'Workers Cleared',
          description: 'All workers have been removed from the database',
        });
      } else {
        toast({
          title: 'Error Clearing Workers',
          description: 'Failed to clear workers. Check console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during clearing:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while clearing workers.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Worker Data Management
        </CardTitle>
        <CardDescription>
          Seed the database with dummy worker data for testing manufacturing steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          This will create 15 dummy workers with different roles suitable for manufacturing operations:
          cutting, welding, assembly, finishing, QC, and packaging.
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSeedWorkers}
            disabled={isSeeding}
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            {isSeeding ? 'Seeding...' : 'Seed Workers'}
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleClearWorkers}
            disabled={isClearing}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkerSeeder;
