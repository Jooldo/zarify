
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Printer, ArrowDown, Plus, Minus } from 'lucide-react';
import TagPrintForm from './TagPrintForm';
import TagOutForm from './TagOutForm';
import ManualTagInForm from './ManualTagInForm';
import ManualTagOutForm from './ManualTagOutForm';

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
          <TabsList className="grid w-full grid-cols-2 h-16">
            <div className="grid grid-cols-2 gap-1 col-span-2">
              <TabsTrigger value="print" className="flex flex-col items-center gap-1 text-xs h-14">
                <Printer className="h-3 w-3" />
                <span>Print Tag</span>
              </TabsTrigger>
              <TabsTrigger value="tagout" className="flex flex-col items-center gap-1 text-xs h-14">
                <ArrowDown className="h-3 w-3" />
                <span>Tag Out</span>
              </TabsTrigger>
              <TabsTrigger value="manual-in" className="flex flex-col items-center gap-1 text-xs h-14">
                <Plus className="h-3 w-3" />
                <span>Manual Tag In</span>
              </TabsTrigger>
              <TabsTrigger value="manual-out" className="flex flex-col items-center gap-1 text-xs h-14">
                <Minus className="h-3 w-3" />
                <span>Manual Tag Out</span>
              </TabsTrigger>
            </div>
          </TabsList>
          
          <TabsContent value="print" className="mt-3">
            <TagPrintForm onTagGenerated={onOperationComplete} />
          </TabsContent>
          
          <TabsContent value="tagout" className="mt-3">
            <TagOutForm onOperationComplete={onOperationComplete} />
          </TabsContent>

          <TabsContent value="manual-in" className="mt-3">
            <ManualTagInForm onOperationComplete={onOperationComplete} />
          </TabsContent>

          <TabsContent value="manual-out" className="mt-3">
            <ManualTagOutForm onOperationComplete={onOperationComplete} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
