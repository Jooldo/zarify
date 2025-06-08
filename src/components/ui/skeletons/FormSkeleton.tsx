
import { Skeleton } from '@/components/ui/skeleton';

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  buttonsCount?: number;
}

const FormSkeleton = ({ 
  fields = 4, 
  showButtons = true,
  buttonsCount = 2 
}: FormSkeletonProps) => {
  return (
    <div className="space-y-6 p-1">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton 
            className="w-24 h-4 animate-shimmer" 
            style={{ animationDelay: `${index * 150}ms` }}
          />
          <Skeleton 
            className="w-full h-10 animate-shimmer" 
            style={{ animationDelay: `${index * 150 + 75}ms` }}
          />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex gap-3 pt-6">
          {Array.from({ length: buttonsCount }).map((_, index) => (
            <Skeleton 
              key={index} 
              className="w-24 h-10 animate-shimmer" 
              style={{ animationDelay: `${fields * 150 + index * 200}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FormSkeleton;
