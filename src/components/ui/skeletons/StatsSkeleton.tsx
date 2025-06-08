
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatsSkeletonProps {
  cards?: number;
}

const StatsSkeleton = ({ cards = 4 }: StatsSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index} className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton 
                className="w-20 h-4 animate-shimmer" 
                style={{ animationDelay: `${index * 200}ms` }}
              />
              <Skeleton 
                className="w-5 h-5 rounded animate-shimmer" 
                style={{ animationDelay: `${index * 200 + 100}ms` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton 
              className="w-16 h-8 mb-3 animate-shimmer" 
              style={{ animationDelay: `${index * 200 + 200}ms` }}
            />
            <Skeleton 
              className="w-24 h-3 animate-shimmer" 
              style={{ animationDelay: `${index * 200 + 300}ms` }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsSkeleton;
