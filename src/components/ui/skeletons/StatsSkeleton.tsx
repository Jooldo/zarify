
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatsSkeletonProps {
  cards?: number;
}

const StatsSkeleton = ({ cards = 4 }: StatsSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-4 h-4 rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="w-12 h-8 mb-2" />
            <Skeleton className="w-20 h-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsSkeleton;
