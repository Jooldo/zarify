
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Zap } from 'lucide-react';
import { useConversationalQuery } from '@/hooks/useConversationalQuery';
import QueryResponseDisplay from './QueryResponseDisplay';

interface ConversationalQueryWidgetProps {
  onNavigateToTab?: (tab: string) => void;
}

const QUICK_QUESTIONS = [
  "What's my low stock?",
  "Show pending orders", 
  "Materials to procure",
  "Finished goods status",
  "Orders delivered this week",
  "Critical raw materials",
  "Manufacturing progress",
  "Top shortfall materials",
  "Procurement requests",
  "Below threshold items",
  "Order funnel status",
  "Latest deliveries"
];

const ConversationalQueryWidget = ({ onNavigateToTab }: ConversationalQueryWidgetProps) => {
  const [query, setQuery] = useState('');
  const { queryHistory, isProcessing, processQuery } = useConversationalQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    await processQuery(query);
    setQuery('');
  };

  const handleQuickQuestion = async (question: string) => {
    if (isProcessing) return;
    await processQuery(question);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Ask Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Questions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
            <Zap className="h-3 w-3" />
            Quick Questions
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(question)}
                disabled={isProcessing}
                className="h-7 px-2 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your inventory, orders, or procurement..."
            disabled={isProcessing}
            className="text-sm"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!query.trim() || isProcessing}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Responses */}
        <ScrollArea className="h-72">
          <div className="space-y-4 pr-4">
            {queryHistory.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-6">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <p>Click a quick question above or ask your own</p>
              </div>
            ) : (
              queryHistory.map((response, index) => (
                <div key={index} className="space-y-2">
                  {/* User Query */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">{response.query}</p>
                  </div>
                  
                  {/* AI Response */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <QueryResponseDisplay 
                      response={response} 
                      onNavigateToTab={onNavigateToTab}
                    />
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  Analyzing your data...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationalQueryWidget;
