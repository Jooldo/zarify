
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 text-center relative">
        <Badge className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30 rounded-full">
          <Package className="h-4 w-4 mr-2" />
          Ready to Transform Your Manufacturing?
        </Badge>
        
        <h2 className="text-6xl md:text-8xl font-bold text-white mb-12 leading-tight">
          Start Managing Your
          <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Jewelry Business Better
          </span>
        </h2>
        
        <p className="text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
          Join hundreds of jewelry manufacturers who have streamlined their operations with Zarify. 
          Reduce costs, improve efficiency, and grow your business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
          <Button 
            size="lg" 
            onClick={() => navigate('/app')}
            className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 group"
          >
            <span className="flex items-center">
              Start Free Trial
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-12 py-6 text-xl font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 group"
          >
            <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            Book Demo
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-12 text-white/70">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5" />
            <span>Secure & Reliable</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5" />
            <span>Quick Setup</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span>No Long-term Contracts</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
