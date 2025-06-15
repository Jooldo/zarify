
import { useUserProfile } from '@/hooks/useUserProfile';

interface VisualDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

const VisualDashboard = ({ onNavigateToTab }: VisualDashboardProps) => {
  const { profile, loading } = useUserProfile();

  const getGreeting = () => {
    if (loading || !profile) return 'Namaskar';
    
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    return fullName ? `Namaskar ${fullName} ji` : 'Namaskar ji';
  };

  const getDashboardTitle = () => {
    if (loading || !profile?.merchantName) return 'Dashboard';
    return `${profile.merchantName} Dashboard`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {getDashboardTitle()}
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-blue-600">{getGreeting()}</p>
          <p className="text-gray-600 text-sm">Welcome to your dashboard. Let's get started!</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px] bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Your new dashboard starts here.</p>
      </div>
    </div>
  );
};

export default VisualDashboard;
