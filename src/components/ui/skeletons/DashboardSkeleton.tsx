
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardSkeletonProps {
  sections?: number;
}

const DashboardSkeleton = ({ sections = 3 }: DashboardSkeletonProps) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <Skeleton className="w-64 h-8 animate-shimmer" />
        <Skeleton 
          className="w-96 h-4 animate-shimmer" 
          style={{ animationDelay: '200ms' }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton 
                  className="w-20 h-4 animate-shimmer" 
                  style={{ animationDelay: `${index * 150}ms` }}
                />
                <Skeleton 
                  className="w-5 h-5 rounded animate-shimmer" 
                  style={{ animationDelay: `${index * 150 + 75}ms` }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton 
                className="w-16 h-8 mb-2 animate-shimmer" 
                style={{ animationDelay: `${index * 150 + 150}ms` }}
              />
              <Skeleton 
                className="w-24 h-3 animate-shimmer" 
                style={{ animationDelay: `${index * 150 + 225}ms` }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: sections }).map((_, sectionIndex) => (
          <Card key={sectionIndex} className="shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <Skeleton 
                className="w-48 h-6 animate-shimmer" 
                style={{ animationDelay: `${600 + sectionIndex * 200}ms` }}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton 
                    className="w-8 h-8 rounded animate-shimmer" 
                    style={{ animationDelay: `${800 + sectionIndex * 200 + itemIndex * 100}ms` }}
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton 
                      className="w-3/4 h-4 animate-shimmer" 
                      style={{ animationDelay: `${850 + sectionIndex * 200 + itemIndex * 100}ms` }}
                    />
                    <Skeleton 
                      className="w-1/2 h-3 animate-shimmer" 
                      style={{ animationDelay: `${900 + sectionIndex * 200 + itemIndex * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
