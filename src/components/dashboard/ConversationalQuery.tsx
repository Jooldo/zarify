
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Lightbulb, RotateCcw } from 'lucide-react';
import { useConversationalQuery, QueryResponse } from '@/hooks/useConversationalQuery';
import QueryResponseDisplay from './QueryResponseDisplay';

interface ConversationalQueryProps {
  onNavigateToTab?: (tab: string) => void;
}

const ConversationalQuery = ({ onNavigateToTab }: ConversationalQueryProps) => {
  const [query, setQuery] = useState('');
  const { queryHistory, processQuery, isProcessing, clearHistory } = useConversationalQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    await processQuery(query);
    setQuery('');
  };

  const handleQuickQuery = (quickQuery: string) => {
    setQuery(quickQuery);
  };

  const quickQueries = [
    "Show raw materials with shortfall",
    "Which finished goods need manufacturing?",
    "List pending orders",
    "Show procurement requests status",
    "What's delivered this week?",
    "Materials below threshold"
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          Ask Your Data
        </h1>
        <p className="text-gray-600 text-sm">Ask questions about your inventory, orders, and operations in natural language</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversation</CardTitle>
                {queryHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {queryHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="max-w-md">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Ask questions about your business data in natural language. I can help you analyze inventory, orders, procurement, and more.
                      </p>
                      <div className="text-xs text-gray-500">
                        Try: "What raw materials are running low?" or "Show pending orders"
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queryHistory.map((item) => (
                      <div key={item.id} className="space-y-3">
                        {/* User Query */}
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-md">
                            <p className="text-sm">{item.query}</p>
                            <div className="text-xs opacity-75 mt-1">
                              {item.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-lg p-4 max-w-2xl shadow-sm">
                            <QueryResponseDisplay 
                              response={item} 
                              onNavigateToTab={onNavigateToTab}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your business data..."
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!query.trim() || isProcessing}
                    className="px-3"
                  >
                    {isProcessing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Queries Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Quick Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQueries.map((quickQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-2 px-3"
                  onClick={() => handleQuickQuery(quickQuery)}
                >
                  <span className="text-xs leading-relaxed">{quickQuery}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Query Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Inventory</Badge>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>"Show top 5 materials by shortfall"</div>
                  <div>"Which products need restocking?"</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Orders</Badge>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>"How many orders this month?"</div>
                  <div>"Show high-value pending orders"</div>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Operations</Badge>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>"Manufacturing status update"</div>
                  <div>"Supplier performance summary"</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConversationalQuery;
