
import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

interface UseNavigationControlProps {
  hideNavbar?: boolean;
  hidePageHeader?: boolean;
}

export const useNavigationControl = ({ 
  hideNavbar = false, 
  hidePageHeader = false 
}: UseNavigationControlProps = {}) => {
  const { setHideNavbar, setHidePageHeader } = useNavigation();

  useEffect(() => {
    setHideNavbar(hideNavbar);
    setHidePageHeader(hidePageHeader);

    // Cleanup: reset to defaults when component unmounts
    return () => {
      setHideNavbar(false);
      setHidePageHeader(false);
    };
  }, [hideNavbar, hidePageHeader, setHideNavbar, setHidePageHeader]);

  return { setHideNavbar, setHidePageHeader };
};
