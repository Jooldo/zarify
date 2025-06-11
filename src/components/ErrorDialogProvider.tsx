
import { useEffect } from 'react';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { useErrorDialog } from '@/hooks/use-error-dialog';

export const ErrorDialogProvider = () => {
  const { errorState, showError, hideError } = useErrorDialog();

  useEffect(() => {
    const handleErrorDialog = (event: CustomEvent) => {
      showError(event.detail.title, event.detail.description);
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
      title={errorState.title}
      description={errorState.description}
    />
  );
};
