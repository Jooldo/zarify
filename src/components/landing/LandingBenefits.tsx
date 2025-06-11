
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, BarChart3, Clock, DollarSign, CheckCircle } from 'lucide-react';

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
              Your Manufacturing Business
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-16 w-16 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Reduce Inventory Costs</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Optimize stock levels and reduce carrying costs with intelligent inventory management
            </p>
            <div className="text-5xl font-bold text-emerald-600">20%</div>
            <div className="text-gray-500 font-medium">Cost Reduction</div>
          </div>
          
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Faster Order Fulfillment</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Streamlined workflows and automated processes speed up order processing
            </p>
            <div className="text-5xl font-bold text-blue-600">30%</div>
            <div className="text-gray-500 font-medium">Time Improvement</div>
          </div>
          
          <div className="text-center group">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Eliminate Manual Errors</h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Digital tracking and automated workflows reduce human errors significantly
            </p>
            <div className="text-5xl font-bold text-purple-600">85%</div>
            <div className="text-gray-500 font-medium">Error Reduction</div>
          </div>
        </div>

        {/* Additional benefits grid */}
        <div className="grid md:grid-cols-2 gap-12 mt-20 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Improve On-Time Delivery</h4>
              <p className="text-gray-600">Achieve 95% on-time delivery rate with better production planning and order tracking</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Better Decision Making</h4>
              <p className="text-gray-600">Real-time analytics and insights help you make informed business decisions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBenefits;
