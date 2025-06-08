
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
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-2">
          {showIcons && <Skeleton className="w-4 h-4 rounded" />}
          <div className="flex-1 space-y-1">
            <Skeleton className="w-3/4 h-4" />
            {showSubtext && <Skeleton className="w-1/2 h-3" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
