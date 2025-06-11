
export type ErrorType = 'validation' | 'network' | 'auth' | 'system' | 'permission' | 'timeout';

export interface ErrorDetails {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  actionable: boolean;
  retryable: boolean;
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
