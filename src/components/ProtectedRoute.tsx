
import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <CardSkeleton 
            showHeader={true}
            headerHeight="h-8"
            contentHeight="h-24"
            showFooter={false}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
