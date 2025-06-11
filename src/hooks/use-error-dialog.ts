
import { useState } from 'react';

interface ErrorState {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export const useErrorDialog = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    isOpen: false,
    title: undefined,
    description: undefined,
  });

  const showError = (title?: string, description?: string) => {
    setErrorState({
      isOpen: true,
      title,
      description,
    });
  };

  const hideError = () => {
    setErrorState({
      isOpen: false,
      title: undefined,
      description: undefined,
    });
  };

  return {
    errorState,
    showError,
    hideError,
  };
};
