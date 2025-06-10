
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Printer, ArrowDown } from 'lucide-react';
import TagPrintForm from './TagPrintForm';
import TagOutForm from './TagOutForm';

interface TagScanInterfaceProps {
  onOperationComplete?: () => void;
}

const TagScanInterface = ({ onOperationComplete }: TagScanInterfaceProps) => {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scan className="h-4 w-4" />
          Tag Management
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="print" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="print" className="flex items-center gap-1 text-xs">
              <Printer className="h-3 w-3" />
              Print Tag
            </TabsTrigger>
            <TabsTrigger value="tagout" className="flex items-center gap-1 text-xs">
              <ArrowDown className="h-3 w-3" />
              Tag Out
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="print" className="mt-3">
            <TagPrintForm onTagGenerated={onOperationComplete} />
          </TabsContent>
          
          <TabsContent value="tagout" className="mt-3">
            <TagOutForm onOperationComplete={onOperationComplete} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
