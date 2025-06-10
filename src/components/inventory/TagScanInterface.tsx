
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { Scan, ArrowUp, ArrowDown, Tag } from 'lucide-react';

interface TagScanInterfaceProps {
  onOperationComplete?: () => void;
}

const TagScanInterface = ({ onOperationComplete }: TagScanInterfaceProps) => {
  const [tagId, setTagId] = useState('');
  const [operationType, setOperationType] = useState<'Tag In' | 'Tag Out'>('Tag In');
  const [loading, setLoading] = useState(false);
  
  const { processTagOperation } = useInventoryTags();

  const handleScanTag = async () => {
    if (!tagId.trim()) return;

    setLoading(true);
    try {
      await processTagOperation(tagId.trim(), operationType);
      setTagId('');
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanTag();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Tag Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={operationType === 'Tag In' ? 'default' : 'outline'}
            onClick={() => setOperationType('Tag In')}
            className="flex-1"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Tag In
          </Button>
          <Button
            variant={operationType === 'Tag Out' ? 'default' : 'outline'}
            onClick={() => setOperationType('Tag Out')}
            className="flex-1"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Tag Out
          </Button>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted">
          <Badge variant={operationType === 'Tag In' ? 'default' : 'destructive'}>
            {operationType} Mode
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagId">Tag ID or Scan QR Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="tagId"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag ID or scan QR..."
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleScanTag} 
              disabled={!tagId.trim() || loading}
            >
              {loading ? 'Processing...' : 'Scan'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• <strong>Tag In:</strong> Adds inventory to stock</div>
          <div>• <strong>Tag Out:</strong> Removes inventory from stock</div>
          <div>• Enter tag ID manually or scan QR code</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
