
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';

interface TagInFormProps {
  onOperationComplete?: () => void;
}

const TagInForm = ({ onOperationComplete }: TagInFormProps) => {
  const [tagId, setTagId] = useState('');
  const [loading, setLoading] = useState(false);
  const { processTagOperation } = useInventoryTags();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tagId) {
      toast({
        title: 'Error',
        description: 'Tag ID is required.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await processTagOperation(tagId, 'Tag In');
      toast({
        title: 'Success',
        description: `Tag ${tagId} processed for Tag In successfully.`,
      });
      setTagId('');
      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error: any) {
      // Error toast is handled by the hook, but you could add more specific ones here if needed
      console.error('Error processing Tag In:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tagId-in" className="text-xs">Tag ID</Label>
        <Input
          id="tagId-in"
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
          placeholder="Scan or enter Tag ID"
          className="h-9"
        />
      </div>
      <Button type="submit" disabled={loading || !tagId} className="w-full h-9 text-xs">
        {loading ? 'Processing...' : (
          <>
            <ArrowUp className="h-3.5 w-3.5 mr-1" />
            Process Tag In
          </>
        )}
      </Button>
    </form>
  );
};

export default TagInForm;
