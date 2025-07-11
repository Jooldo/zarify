
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 text-center relative">
        <Badge className="mb-4 px-3 py-1 bg-white/20 text-white border-white/30 rounded-full text-xs">
          <Package className="h-3 w-3 mr-2" />
          Ready to Transform Your Manufacturing?
        </Badge>
        
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
          Start Managing Your Jewelry Business Better
        </h2>
        
        <p className="text-base text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of jewelry manufacturers who have streamlined their operations with Zarify. 
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            size="lg" 
            onClick={() => navigate('/app')}
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-base font-bold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 group"
          >
            <span className="flex items-center">
              Start Free Trial
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 text-base font-bold rounded-xl transform hover:scale-105 transition-all duration-300 group"
          >
            <Users className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            Book Demo
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-white/70">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3" />
            <span className="text-sm">Secure & Reliable</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span className="text-sm">Quick Setup</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3" />
            <span className="text-sm">No Contracts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingCTA;
