
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, BarChart3 } from 'lucide-react';

const LandingBenefits = () => {
  return (
    <section id="benefits" className="py-32 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto mb-24">
          <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
            Proven Results
          </Badge>
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Measurable Impact on
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Your Bottom Line
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-16">
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <Package className="h-16 w-16 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Reduce Material Waste</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              AI insights help you order the right materials at the right time, reducing waste by up to 40%
            </p>
            <div className="text-5xl font-bold text-emerald-600">40%</div>
            <div className="text-gray-500 font-medium">Average Waste Reduction</div>
          </div>
          
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Increase Productivity</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Optimize production schedules based on material availability and demand forecasts
            </p>
            <div className="text-5xl font-bold text-blue-600">50%</div>
            <div className="text-gray-500 font-medium">Productivity Increase</div>
          </div>
          
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Improve Stock Levels</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Maintain optimal inventory levels to fulfill orders faster without overstocking
            </p>
            <div className="text-5xl font-bold text-purple-600">60%</div>
            <div className="text-gray-500 font-medium">Better Stock Management</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBenefits;
