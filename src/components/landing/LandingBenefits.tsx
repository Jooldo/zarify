
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

const LandingBenefits = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mb-12">
          <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full text-xs">
            Proven Results
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight text-left">
            Measurable Impact on <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Your Business</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reduce Inventory Costs</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Optimize stock levels and reduce carrying costs
            </p>
            <div className="text-2xl font-bold text-emerald-600">20%</div>
            <div className="text-gray-500 text-sm font-medium">Cost Reduction</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Faster Order Fulfillment</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Streamlined workflows and automated processes
            </p>
            <div className="text-2xl font-bold text-blue-600">30%</div>
            <div className="text-gray-500 text-sm font-medium">Time Improvement</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminate Manual Errors</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Digital tracking and automated workflows
            </p>
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <div className="text-gray-500 text-sm font-medium">Error Reduction</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Improve On-Time Delivery</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">Better production planning for on-time fulfillment</p>
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-gray-500 text-sm font-medium">On-Time Delivery</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Better Decision Making</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">Real-time analytics and insights for informed decisions</p>
            <div className="text-2xl font-bold text-orange-600">40%</div>
            <div className="text-gray-500 text-sm font-medium">Faster Insights</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingBenefits;
