
import { useState } from 'react';
import { ErrorDetails, ErrorAction } from '@/types/error';

interface ErrorDialogState {
  isOpen: boolean;
  error?: ErrorDetails;
  actions?: ErrorAction[];
}

export const useErrorDialog = () => {
  const [errorState, setErrorState] = useState<ErrorDialogState>({
    isOpen: false,
    error: undefined,
    actions: undefined,
  });

  const showError = (error: ErrorDetails, actions?: ErrorAction[]) => {
    console.log('Error occurred:', error);
    setErrorState({
      isOpen: true,
      error,
      actions,
    });
  };

  const hideError = () => {
    setErrorState({
      isOpen: false,
      error: undefined,
      actions: undefined,
    });
  };

  const retry = () => {
    if (errorState.error?.is_retryable && errorState.actions) {
      const retryAction = errorState.actions.find(action => action.label.toLowerCase().includes('retry'));
      if (retryAction) {
        retryAction.action();
      }
    }
  };

  return {
    errorState,
    showError,
    hideError,
    retry,
  };
};
