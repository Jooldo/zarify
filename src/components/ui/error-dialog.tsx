
import { 
  AlertTriangle, 
  Wifi, 
  Lock, 
  Shield, 
  Settings, 
  Clock,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorDetails, ErrorAction, ErrorType } from '@/types/error';
import { cn } from '@/lib/utils';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error?: ErrorDetails;
  actions?: ErrorAction[];
}

const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case 'validation':
      return AlertTriangle;
    case 'network':
      return Wifi;
    case 'auth':
      return Lock;
    case 'permission':
      return Shield;
    case 'system':
      return Settings;
    case 'timeout':
      return Clock;
    default:
      return AlertTriangle;
  }
};

const getErrorColor = (type: ErrorType) => {
  // Make all error icons red for consistency
  return 'text-red-600';
};

const getBadgeVariant = (type: ErrorType) => {
  switch (type) {
    case 'validation':
      return 'secondary';
    case 'network':
      return 'outline';
    case 'auth':
      return 'destructive';
    case 'permission':
      return 'outline';
    case 'system':
      return 'secondary';
    case 'timeout':
      return 'outline';
    default:
      return 'destructive';
  }
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-orange-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const ErrorDialog = ({ isOpen, onClose, error, actions }: ErrorDialogProps) => {
  if (!error) return null;

  const Icon = getErrorIcon(error.type);
  const iconColor = getErrorColor(error.type);
  const badgeVariant = getBadgeVariant(error.type);
  const severityColor = getSeverityColor(error.severity);

  const defaultActions: ErrorAction[] = [
    {
      label: 'Close',
      action: onClose,
      variant: 'outline',
    },
  ];

  if (error.is_retryable && !actions?.some(action => action.label.toLowerCase().includes('retry'))) {
    defaultActions.unshift({
      label: 'Retry',
      action: () => {
        console.log('Retry action triggered for error:', error.error_code);
        onClose();
      },
      variant: 'default',
    });
  }

  const finalActions = actions && actions.length > 0 ? actions : defaultActions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6">
          <DialogHeader className="space-y-0">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <Icon className={cn("h-6 w-6", iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <DialogTitle className="text-left leading-tight text-lg font-semibold">
                    {error.title}
                  </DialogTitle>
                  <Badge variant={badgeVariant} className="text-xs font-medium">
                    {error.type.toUpperCase()}
                  </Badge>
                  {error.severity && (
                    <Badge variant="outline" className={cn("text-xs font-medium", severityColor)}>
                      {error.severity.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-left leading-relaxed text-gray-700 dark:text-gray-300">
                  {error.message}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[50vh] px-6">
          {error.description && (
            <div className="mb-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  What happened?
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                  {error.description}
                </p>
              </div>
            </div>
          )}

          {error.possible_causes && error.possible_causes.length > 0 && (
            <div className="mb-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm font-semibold mb-3 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Possible Causes
                </h4>
                <ul className="space-y-2">
                  {error.possible_causes.map((cause, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-amber-600 dark:text-amber-400">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error.action_items && error.action_items.length > 0 && (
            <div className="mb-4">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {error.action_items.map((action, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-green-600 dark:text-green-400">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3 w-full">
            {finalActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.action}
                className={cn(
                  "flex-1",
                  action.label.toLowerCase().includes('retry') && "gap-2"
                )}
              >
                {action.label.toLowerCase().includes('retry') && (
                  <RefreshCw className="h-4 w-4" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
