
import { useState } from 'react';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, User, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ActivityLogsTab = () => {
  const { logs, loading } = useActivityLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntityType = filterEntityType === 'all' || log.entity_type === filterEntityType;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesEntityType && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'updated':
      case 'changed':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
      case 'removed':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'order':
        return '📦';
      case 'product':
        return '🏷️';
      case 'inventory':
        return '📋';
      case 'procurement':
        return '🛒';
      case 'customer':
        return '👤';
      default:
        return '📄';
    }
  };

  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entity_type)));
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0 ? new Date(logs[0].timestamp).toLocaleDateString() : 'No data'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(log => log.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterEntityType} onValueChange={setFilterEntityType}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueEntityTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-9">
              <TableHead className="py-2 px-3 text-xs font-medium">Timestamp</TableHead>
              <TableHead className="py-2 px-3 text-xs font-medium">User</TableHead>
              <TableHead className="py-2 px-3 text-xs font-medium">Action</TableHead>
              <TableHead className="py-2 px-3 text-xs font-medium">Entity</TableHead>
              <TableHead className="py-2 px-3 text-xs font-medium">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="h-12 hover:bg-gray-50">
                <TableCell className="py-2 px-3 text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {new Date(log.timestamp).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs">
                  <div className="font-medium">{log.user_name}</div>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <Badge className={`text-xs px-2 py-1 ${getActionColor(log.action)}`}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEntityTypeIcon(log.entity_type)}</span>
                    <span className="font-medium">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="text-gray-500 text-xs">#{log.entity_id}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3 text-xs">
                  <div className="max-w-md">
                    {log.description}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No activity logs found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsTab;
