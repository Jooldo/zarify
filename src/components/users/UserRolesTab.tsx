
import React from 'react';
import { Shield } from 'lucide-react';
import UserRolesSection from './UserRolesSection';
import { useHasRole } from '@/hooks/useUserRoles';

const UserRolesTab = () => {
  console.log('🎯 UserRolesTab rendering...');
  
  const { data: isAdmin, isLoading, error } = useHasRole('admin');

  console.log('👑 Admin check:', { isAdmin, isLoading, error });

  if (isLoading) {
    console.log('⏳ Loading admin check...');
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error checking admin role:', error);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Roles</h3>
        <p className="text-muted-foreground text-center">
          There was an error checking your permissions. Please try again.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('🚫 User is not admin, showing access restricted');
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground text-center">
          You need admin privileges to access user role management.
        </p>
      </div>
    );
  }

  console.log('✅ User is admin, rendering UserRolesSection');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">User Roles</h2>
        <p className="text-muted-foreground">
          Manage user roles and permissions for your organization
        </p>
      </div>
      <UserRolesSection />
    </div>
  );
};

export default UserRolesTab;
