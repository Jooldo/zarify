
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TaggedInventoryBadgeProps {
  isTagEnabled: boolean;
}

const TaggedInventoryBadge = ({ isTagEnabled }: TaggedInventoryBadgeProps) => {
  if (!isTagEnabled) return null;

  return (
    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
      <Tag className="h-3 w-3" />
      Tagged
    </Badge>
  );
};

export default TaggedInventoryBadge;
