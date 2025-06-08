
import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  columnWidths?: string[];
}

const TableSkeleton = ({ 
  rows = 5, 
  columns = 6, 
  showHeader = true,
  columnWidths = []
}: TableSkeletonProps) => {
  const defaultWidths = Array(columns).fill('w-24');
  const widths = columnWidths.length === columns ? columnWidths : defaultWidths;

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="w-full">
        {showHeader && (
          <div className="border-b bg-muted/50">
            <div className="flex h-8 items-center px-2 gap-2">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className={`h-3 ${widths[i]}`} />
              ))}
            </div>
          </div>
        )}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex h-8 items-center px-2 gap-2 hover:bg-muted/50">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className={`h-3 ${widths[colIndex]}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
