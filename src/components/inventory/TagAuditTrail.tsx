
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTagAuditLog } from '@/hooks/useTagAuditLog';
import { History, Search, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const TagAuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { auditLogs, loading, refetch } = useTagAuditLog();

  const filteredLogs = auditLogs.filter(log =>
    log.tag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.finished_goods.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-lg">Loading audit trail...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Tag Audit Trail
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by tag ID, product code, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Stock Change</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? 'No matching audit logs found' : 'No tag operations recorded yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {log.tag_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{log.finished_goods.product_code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.action === 'Tag In' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {log.action === 'Tag In' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.action === 'Tag In' ? '+' : '-'}{log.quantity}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {log.previous_stock} → {log.new_stock}
                      </span>
                    </TableCell>
                    <TableCell>{log.user_name}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Showing {filteredLogs.length} of {auditLogs.length} total operations
        </div>
      </CardContent>
    </Card>
  );
};

export default TagAuditTrail;
