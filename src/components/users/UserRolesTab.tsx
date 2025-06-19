
import React from 'react';
import { Shield } from 'lucide-react';
import UserRolesSection from './UserRolesSection';
import { useHasRole } from '@/hooks/useUserRoles';

const UserRolesTab = () => {
  console.log('🎯 UserRolesTab rendering...');
  
  const { data: isAdmin, isLoading, error } = useHasRole('admin');

  console.log('👑 Admin check:', { isAdmin, isLoading, error });

  // Always show the UserRolesSection for now to debug the blank screen
  // We'll add proper role checking later once we confirm the component renders
  console.log('✅ Rendering UserRolesSection (bypassing admin check for debugging)');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">User Roles</h2>
        <p className="text-muted-foreground">
          Manage user roles and permissions for your organization
        </p>
        {/* Debug info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm">Debug Info:</p>
          <p className="text-sm">Is Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p className="text-sm">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          <p className="text-sm">Error: {error ? error.message : 'None'}</p>
        </div>
      </div>
      <UserRolesSection />
    </div>
  );
};

export default UserRolesTab;
