
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Package, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-20 pb-12 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <Badge className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full text-xs">
              <Package className="h-3 w-3 mr-2" />
              Manufacturing & Inventory Management
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live Operations</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            Streamline Your
            <span className="block bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Jewelry Manufacturing
            </span>
          </h1>
          
          <p className="text-base text-gray-600 mb-8 leading-relaxed max-w-2xl">
            Complete platform for jewelry manufacturers to manage raw materials, production workflows, 
            and orders. Reduce costs by 20% and improve delivery times by 30%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 text-base font-medium rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Start Managing Operations
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-200 hover:border-emerald-300 px-8 py-3 text-base font-medium rounded-xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Play className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              See Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-500">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Raw Material Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Production Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Order Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
