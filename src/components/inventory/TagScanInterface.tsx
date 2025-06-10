
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Inventory Tag Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="print" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="print" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Tag
            </TabsTrigger>
            <TabsTrigger value="tagout" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Tag Out
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="print" className="mt-6">
            <TagPrintForm onTagGenerated={onOperationComplete} />
          </TabsContent>
          
          <TabsContent value="tagout" className="mt-6">
            <TagOutForm onOperationComplete={onOperationComplete} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
