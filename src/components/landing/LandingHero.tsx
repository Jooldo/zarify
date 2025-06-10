
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Eye, Brain, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Badge className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered Material & Inventory Intelligence
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live AI Insights</span>
            </div>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-12 leading-tight tracking-tight">
            Smart Insights for
            <span className="block bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent relative">
              Raw Materials &
            </span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 bg-clip-text text-transparent">
              Finished Goods
            </span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
            Zarify uses AI to analyze your raw material consumption and finished goods inventory, 
            providing actionable insights that increase productivity by up to 50% and reduce waste by 40%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-medium rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Start Getting AI Insights
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-200 hover:border-emerald-300 px-12 py-6 text-xl font-medium rounded-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              See AI in Action
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-12 text-gray-500">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">Real-time Material Insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <Brain className="h-5 w-5 text-blue-500" />
              <span className="font-medium">AI-Powered Predictions</span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Productivity Optimization</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
