
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CardSkeletonProps {
  showHeader?: boolean;
  headerHeight?: string;
  contentHeight?: string;
  showFooter?: boolean;
  footerHeight?: string;
}

const CardSkeleton = ({ 
  showHeader = true,
  headerHeight = 'h-16',
  contentHeight = 'h-32',
  showFooter = false,
  footerHeight = 'h-12'
}: CardSkeletonProps) => {
  return (
    <Card className="shadow-sm overflow-hidden">
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <Skeleton className="w-3/4 h-5 animate-shimmer" />
            <Skeleton 
              className="w-1/2 h-3 animate-shimmer" 
              style={{ animationDelay: '200ms' }}
            />
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        <div className={`space-y-3 ${contentHeight}`}>
          <Skeleton 
            className="w-full h-4 animate-shimmer" 
            style={{ animationDelay: '100ms' }}
          />
          <Skeleton 
            className="w-5/6 h-4 animate-shimmer" 
            style={{ animationDelay: '300ms' }}
          />
          <Skeleton 
            className="w-4/5 h-4 animate-shimmer" 
            style={{ animationDelay: '500ms' }}
          />
          <div className="flex gap-2 mt-4">
            <Skeleton 
              className="w-16 h-6 animate-shimmer" 
              style={{ animationDelay: '700ms' }}
            />
            <Skeleton 
              className="w-20 h-6 animate-shimmer" 
              style={{ animationDelay: '900ms' }}
            />
          </div>
        </div>
      </CardContent>
      {showFooter && (
        <div className={`border-t p-4 ${footerHeight}`}>
          <Skeleton 
            className="w-24 h-8 animate-shimmer" 
            style={{ animationDelay: '1100ms' }}
          />
        </div>
      )}
    </Card>
  );
};

export default CardSkeleton;
