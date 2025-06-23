
import { useState, useEffect } from 'react';

export interface UserActivity {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  description: string;
  created_at: string;
}

export const useUserActivityLog = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call when backend is ready
    setTimeout(() => {
      setActivities([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { activities, isLoading };
};
