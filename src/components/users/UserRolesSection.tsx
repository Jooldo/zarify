
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Users, Shield, Eye, Settings, Wrench } from 'lucide-react';
import { useUserRoles, useHasRole } from '@/hooks/useUserRoles';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ROLE_ICONS = {
  admin: Shield,
  manager: Settings,
  worker: Wrench,
  operator: Users,
  viewer: Eye,
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  worker: 'bg-green-100 text-green-800',
  operator: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const UserRolesSection = () => {
  console.log('🎯 UserRolesSection rendering...');
  
  const { userRoles, isLoading, assignRole, deactivateRole, isAssigning, isDeactivating, error } = useUserRoles();
  const { data: isAdmin } = useHasRole('admin');
  
  console.log('📊 UserRolesSection state:', {
    userRoles: userRoles?.length || 0,
    isLoading,
    isAdmin,
    error: error?.message || 'none'
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await assignRole({
        userId: selectedUserId,
        role: selectedRole,
        permissions: selectedRole === 'admin' ? { all: true } : {},
      });
      setIsDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('');
      setUserEmail('');
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleDeactivateRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to deactivate this role?')) {
      try {
        await deactivateRole(roleId);
      } catch (error) {
        console.error('Error deactivating role:', error);
      }
    }
  };

  const getUserDisplayName = (role: any) => {
    if (role.profiles?.first_name || role.profiles?.last_name) {
      return `${role.profiles.first_name || ''} ${role.profiles.last_name || ''}`.trim();
    }
    return role.user_id.slice(-8);
  };

  const getAssignedByName = (role: any) => {
    if (role.assigned_by_profile?.first_name || role.assigned_by_profile?.last_name) {
      return `${role.assigned_by_profile.first_name || ''} ${role.assigned_by_profile.last_name || ''}`.trim();
    }
    return 'System';
  };

  if (isLoading) {
    console.log('⏳ UserRolesSection showing loading state');
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading user roles...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('❌ UserRolesSection showing error state:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Error loading user roles: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('✅ UserRolesSection rendering main content');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Roles Management
        </CardTitle>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userEmail">User Email</Label>
                  <Input
                    id="userEmail"
                    placeholder="Enter user email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssignRole} 
                  disabled={isAssigning}
                  className="w-full"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {userRoles && userRoles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((role) => {
                  const RoleIcon = ROLE_ICONS[role.role as keyof typeof ROLE_ICONS];
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        {getUserDisplayName(role)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${ROLE_COLORS[role.role as keyof typeof ROLE_COLORS]} flex items-center gap-1 w-fit`}>
                          <RoleIcon className="h-3 w-3" />
                          {role.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getAssignedByName(role)}</TableCell>
                      <TableCell>
                        {format(new Date(role.assigned_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_active ? 'default' : 'secondary'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateRole(role.id)}
                            disabled={isDeactivating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No user roles found</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Assign roles to users to manage their access levels
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRolesSection;
