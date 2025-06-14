
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, ArrowDown, ArrowUp } from 'lucide-react';
import TagOutForm from './TagOutForm';
import TagInForm from './TagInForm'; // New import

interface TagScanInterfaceProps {
  onOperationComplete?: () => void;
}

const TagScanInterface = ({ onOperationComplete }: TagScanInterfaceProps) => {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scan className="h-4 w-4" />
          Tag Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="tag-out" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            <TabsTrigger value="tag-out" className="flex items-center gap-1 text-xs h-10 px-2">
              <ArrowDown className="h-3 w-3" />
              <span>Tag Out</span>
            </TabsTrigger>
            <TabsTrigger value="tag-in" className="flex items-center gap-1 text-xs h-10 px-2">
              <ArrowUp className="h-3 w-3" />
              <span>Tag In</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tag-out" className="mt-3">
            <TagOutForm onOperationComplete={onOperationComplete} />
          </TabsContent>
          
          <TabsContent value="tag-in" className="mt-3">
            <TagInForm onOperationComplete={onOperationComplete} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
