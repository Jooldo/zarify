
import { useEffect } from 'react';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { useErrorDialog } from '@/hooks/use-error-dialog';
import { ErrorDetails, ErrorAction } from '@/types/error';

interface ErrorDialogEvent extends CustomEvent {
  detail: {
    error: ErrorDetails;
    actions?: ErrorAction[];
  };
}

export const ErrorDialogProvider = () => {
  const { errorState, showError, hideError } = useErrorDialog();

  useEffect(() => {
    const handleErrorDialog = (event: ErrorDialogEvent) => {
      showError(event.detail.error, event.detail.actions);
    };

    window.addEventListener('show-error-dialog', handleErrorDialog as EventListener);

    return () => {
      window.removeEventListener('show-error-dialog', handleErrorDialog as EventListener);
    };
  }, [showError]);

  return (
    <ErrorDialog
      isOpen={errorState.isOpen}
      onClose={hideError}
      error={errorState.error}
      actions={errorState.actions}
    />
  );
};
