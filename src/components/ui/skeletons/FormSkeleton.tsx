
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
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-8" />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex gap-2 pt-4">
          {Array.from({ length: buttonsCount }).map((_, index) => (
            <Skeleton key={index} className="w-20 h-8" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FormSkeleton;
