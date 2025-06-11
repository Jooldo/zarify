
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Diamond, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-100/50 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300">
              <Diamond className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Zarify</span>
              <div className="text-xs text-gray-500 font-medium">Manufacturing & Inventory Management</div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#benefits" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
              Benefits
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
              Success Stories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 hover:text-emerald-600 font-medium">
              Login
            </Button>
            <Button 
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Try Zarify Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
