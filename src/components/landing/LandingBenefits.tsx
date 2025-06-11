
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, BarChart3, Clock, DollarSign, CheckCircle } from 'lucide-react';

const LandingBenefits = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full text-sm">
            Proven Results
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Measurable Impact on
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Your Manufacturing Business
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Reduce Inventory Costs</h3>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm">
              Optimize stock levels and reduce carrying costs with intelligent inventory management
            </p>
            <div className="text-3xl font-bold text-emerald-600">20%</div>
            <div className="text-gray-500 text-sm font-medium">Cost Reduction</div>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Faster Order Fulfillment</h3>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm">
              Streamlined workflows and automated processes speed up order processing
            </p>
            <div className="text-3xl font-bold text-blue-600">30%</div>
            <div className="text-gray-500 text-sm font-medium">Time Improvement</div>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Eliminate Manual Errors</h3>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm">
              Digital tracking and automated workflows reduce human errors significantly
            </p>
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <div className="text-gray-500 text-sm font-medium">Error Reduction</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Improve On-Time Delivery</h4>
              <p className="text-gray-600 text-sm">Achieve 95% on-time delivery rate with better production planning and order tracking</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Better Decision Making</h4>
              <p className="text-gray-600 text-sm">Real-time analytics and insights help you make informed business decisions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingBenefits;
