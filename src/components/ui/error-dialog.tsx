
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
  switch (type) {
    case 'validation':
      return 'text-amber-600';
    case 'network':
      return 'text-blue-600';
    case 'auth':
      return 'text-red-600';
    case 'permission':
      return 'text-purple-600';
    case 'system':
      return 'text-gray-600';
    case 'timeout':
      return 'text-orange-600';
    default:
      return 'text-red-600';
  }
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
      <DialogContent className="max-w-md sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="flex-shrink-0">
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <DialogTitle className="text-left leading-tight">
                  {error.title}
                </DialogTitle>
                <Badge variant={badgeVariant} className="text-xs">
                  {error.type.toUpperCase()}
                </Badge>
                {error.severity && (
                  <Badge variant="outline" className={cn("text-xs", severityColor)}>
                    {error.severity.toUpperCase()}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-left text-sm leading-relaxed">
                {error.message}
              </DialogDescription>
            </div>
          </div>

          <ScrollArea className="max-h-[40vh]">
            {error.description && (
              <>
                <Separator className="my-3" />
                <div className="bg-muted/50 rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {error.description}
                  </p>
                </div>
              </>
            )}

            {error.possible_causes && error.possible_causes.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="bg-muted/50 rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Possible Causes
                  </h4>
                  <ul className="text-xs text-muted-foreground leading-relaxed space-y-1">
                    {error.possible_causes.map((cause, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {error.action_items && error.action_items.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed space-y-1">
                    {error.action_items.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </ScrollArea>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
            <span>Error Code: {error.error_code}</span>
            <span>•</span>
            <span>{error.timestamp.toLocaleTimeString()}</span>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          {finalActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.action}
              className={cn(
                "w-full sm:w-auto",
                action.label.toLowerCase().includes('retry') && "gap-2"
              )}
            >
              {action.label.toLowerCase().includes('retry') && (
                <RefreshCw className="h-4 w-4" />
              )}
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
