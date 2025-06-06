
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { useConversationalQuery } from '@/hooks/useConversationalQuery';
import QueryResponseDisplay from './QueryResponseDisplay';

interface ConversationalQueryWidgetProps {
  onNavigateToTab?: (tab: string) => void;
}

const ConversationalQueryWidget = ({ onNavigateToTab }: ConversationalQueryWidgetProps) => {
  const [query, setQuery] = useState('');
  const { responses, isLoading, submitQuery } = useConversationalQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    await submitQuery(query);
    setQuery('');
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
        {/* Query Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your inventory, orders, or procurement..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!query.trim() || isLoading}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Responses */}
        <ScrollArea className="h-80">
          <div className="space-y-4 pr-4">
            {responses.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Ask a question about your data to get started</p>
                <div className="mt-3 text-xs space-y-1">
                  <p className="font-medium">Try asking:</p>
                  <p>"What's my low stock?"</p>
                  <p>"Show pending orders"</p>
                  <p>"Materials to procure"</p>
                </div>
              </div>
            ) : (
              responses.map((response, index) => (
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
            
            {isLoading && (
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
