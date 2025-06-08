
import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  items?: number;
  showIcons?: boolean;
  showSubtext?: boolean;
}

const ListSkeleton = ({ 
  items = 5, 
  showIcons = false,
  showSubtext = false 
}: ListSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
          {showIcons && (
            <Skeleton 
              className="w-5 h-5 rounded animate-shimmer" 
              style={{ animationDelay: `${index * 100}ms` }}
            />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton 
              className="w-3/4 h-4 animate-shimmer" 
              style={{ animationDelay: `${index * 100 + 50}ms` }}
            />
            {showSubtext && (
              <Skeleton 
                className="w-1/2 h-3 animate-shimmer" 
                style={{ animationDelay: `${index * 100 + 150}ms` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
