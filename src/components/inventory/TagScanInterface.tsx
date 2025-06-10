
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Printer, ArrowDown, ArrowUp, Plus, Minus } from 'lucide-react';
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
          <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
            <TabsTrigger value="print" className="flex flex-col items-center gap-1 text-xs h-12 px-2">
              <Printer className="h-3 w-3" />
              <span>Print Tag</span>
            </TabsTrigger>
            <TabsTrigger value="tag-operations" className="flex flex-col items-center gap-1 text-xs h-12 px-2">
              <div className="flex gap-1">
                <ArrowUp className="h-2.5 w-2.5" />
                <ArrowDown className="h-2.5 w-2.5" />
              </div>
              <span>Tag In/Out</span>
            </TabsTrigger>
            <TabsTrigger value="manual-operations" className="flex flex-col items-center gap-1 text-xs h-12 px-2">
              <div className="flex gap-1">
                <Plus className="h-2.5 w-2.5" />
                <Minus className="h-2.5 w-2.5" />
              </div>
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="print" className="mt-3">
            <TagPrintForm onTagGenerated={onOperationComplete} />
          </TabsContent>
          
          <TabsContent value="tag-operations" className="mt-3">
            <Tabs defaultValue="tag-out" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
                <TabsTrigger value="tag-out" className="flex items-center gap-1 text-xs h-8 px-2">
                  <ArrowDown className="h-3 w-3" />
                  <span>Tag Out</span>
                </TabsTrigger>
                <TabsTrigger value="tag-in" className="flex items-center gap-1 text-xs h-8 px-2 opacity-50 cursor-not-allowed" disabled>
                  <ArrowUp className="h-3 w-3" />
                  <span>Tag In</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tag-out" className="mt-3">
                <TagOutForm onOperationComplete={onOperationComplete} />
              </TabsContent>
              
              <TabsContent value="tag-in" className="mt-3">
                <div className="text-center text-sm text-muted-foreground py-4">
                  Tag In happens automatically when scanning printed tags
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="manual-operations" className="mt-3">
            <Tabs defaultValue="manual-in" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
                <TabsTrigger value="manual-in" className="flex items-center gap-1 text-xs h-8 px-2">
                  <Plus className="h-3 w-3" />
                  <span>Manual In</span>
                </TabsTrigger>
                <TabsTrigger value="manual-out" className="flex items-center gap-1 text-xs h-8 px-2">
                  <Minus className="h-3 w-3" />
                  <span>Manual Out</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual-in" className="mt-3">
                <ManualTagInForm onOperationComplete={onOperationComplete} />
              </TabsContent>

              <TabsContent value="manual-out" className="mt-3">
                <ManualTagOutForm onOperationComplete={onOperationComplete} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
