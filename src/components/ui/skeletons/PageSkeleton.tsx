
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  showHeader?: boolean;
  showTabs?: boolean;
  tabsCount?: number;
  contentType?: 'table' | 'cards' | 'mixed';
}

const PageSkeleton = ({ 
  showHeader = true,
  showTabs = false,
  tabsCount = 3,
  contentType = 'mixed'
}: PageSkeletonProps) => {
  const renderContent = () => {
    switch (contentType) {
      case 'table':
        return (
          <div className="border rounded-md overflow-hidden bg-white">
            <div className="border-b bg-muted/50 p-4">
              <div className="flex gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="w-24 h-4 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-4">
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <Skeleton 
                      key={colIndex} 
                      className="w-24 h-4 animate-shimmer" 
                      style={{ animationDelay: `${600 + rowIndex * 200 + colIndex * 50}ms` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-6 bg-white">
                <Skeleton 
                  className="w-3/4 h-5 mb-4 animate-shimmer" 
                  style={{ animationDelay: `${index * 150}ms` }}
                />
                <Skeleton 
                  className="w-full h-4 mb-2 animate-shimmer" 
                  style={{ animationDelay: `${index * 150 + 75}ms` }}
                />
                <Skeleton 
                  className="w-2/3 h-4 animate-shimmer" 
                  style={{ animationDelay: `${index * 150 + 150}ms` }}
                />
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-6 bg-white">
                  <Skeleton 
                    className="w-3/4 h-5 mb-4 animate-shimmer" 
                    style={{ animationDelay: `${index * 200}ms` }}
                  />
                  <Skeleton 
                    className="w-full h-20 animate-shimmer" 
                    style={{ animationDelay: `${index * 200 + 100}ms` }}
                  />
                </div>
              ))}
            </div>
            <div className="border rounded-md overflow-hidden bg-white">
              <div className="border-b bg-muted/50 p-4">
                <div className="flex gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-24 h-4 animate-shimmer" style={{ animationDelay: `${600 + i * 100}ms` }} />
                  ))}
                </div>
              </div>
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4 p-4">
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <Skeleton 
                        key={colIndex} 
                        className="w-24 h-4 animate-shimmer" 
                        style={{ animationDelay: `${1100 + rowIndex * 200 + colIndex * 50}ms` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {showHeader && (
        <div className="mb-8 space-y-4">
          <Skeleton className="w-64 h-8 animate-shimmer" />
          <Skeleton 
            className="w-96 h-4 animate-shimmer" 
            style={{ animationDelay: '200ms' }}
          />
        </div>
      )}

      {showTabs && (
        <div className="mb-8">
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            {Array.from({ length: tabsCount }).map((_, index) => (
              <Skeleton 
                key={index} 
                className="w-24 h-10 animate-shimmer" 
                style={{ animationDelay: `${400 + index * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default PageSkeleton;
