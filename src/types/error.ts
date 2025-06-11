
export type ErrorType = 'validation' | 'network' | 'auth' | 'system' | 'permission' | 'timeout';

export interface ErrorDetails {
  error_code: string;
  type: ErrorType;
  title: string;
  message: string;
  description?: string;
  possible_causes?: string[];
  action_items?: string[];
  timestamp: Date;
  is_retryable: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
