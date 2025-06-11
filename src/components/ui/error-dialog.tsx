
import { 
  AlertTriangle, 
  Wifi, 
  Lock, 
  Shield, 
  Settings, 
  Clock,
  RefreshCw,
  X 
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

export const ErrorDialog = ({ isOpen, onClose, error, actions }: ErrorDialogProps) => {
  if (!error) return null;

  const Icon = getErrorIcon(error.type);
  const iconColor = getErrorColor(error.type);
  const badgeVariant = getBadgeVariant(error.type);

  const defaultActions: ErrorAction[] = [
    {
      label: 'Close',
      action: onClose,
      variant: 'outline',
    },
  ];

  if (error.retryable && !actions?.some(action => action.label.toLowerCase().includes('retry'))) {
    defaultActions.unshift({
      label: 'Retry',
      action: () => {
        console.log('Retry action triggered for error:', error.id);
        onClose();
      },
      variant: 'default',
    });
  }

  const finalActions = actions && actions.length > 0 ? actions : defaultActions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="flex-shrink-0">
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-left leading-tight">
                  {error.title}
                </DialogTitle>
                <Badge variant={badgeVariant} className="text-xs">
                  {error.type.toUpperCase()}
                </Badge>
              </div>
              <DialogDescription className="text-left text-sm leading-relaxed">
                {error.message}
              </DialogDescription>
            </div>
          </div>

          {error.details && (
            <>
              <Separator className="my-3" />
              <div className="bg-muted/50 rounded-md p-3">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Details</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                  {error.details}
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
            <span>Error ID: {error.id}</span>
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
