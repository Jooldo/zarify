
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  firstName: string;
  lastName: string;
  merchantName: string;
  merchantId: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          first_name,
          last_name,
          merchant:merchants(id, name)
        `)
        .eq('id', user.user.id)
        .single();

      if (error) throw error;

      if (profileData && profileData.merchant) {
        setProfile({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          merchantName: profileData.merchant.name || '',
          merchantId: profileData.merchant.id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { profile, loading, refetch: fetchUserProfile };
};
