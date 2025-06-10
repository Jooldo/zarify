
import { CheckCircle, AlertTriangle, Package, Brain, Eye, TrendingUp, Lightbulb, Gem, Diamond, Sparkles } from 'lucide-react';

export const RawMaterialInsight = () => (
  <div className="relative w-80 h-64 mx-auto">
    {/* Material Storage Facility */}
    <div className="absolute bottom-8 left-8 w-64 h-32 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-xl">
      {/* Storage Compartments */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-6 h-6 rounded ${i % 3 === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : i % 3 === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'} animate-pulse flex items-center justify-center`} style={{animationDelay: `${i * 0.2}s`}}>
            {i % 4 === 0 && <Gem className="h-3 w-3 text-white" />}
            {i % 4 === 1 && <Diamond className="h-3 w-3 text-white" />}
            {i % 4 === 2 && <Package className="h-3 w-3 text-white" />}
          </div>
        ))}
      </div>
    </div>
    
    {/* AI Analysis Brain */}
    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
      <Brain className="h-10 w-10 text-white" />
    </div>
    
    {/* Smart Alerts */}
    <div className="absolute top-8 left-4 space-y-2">
      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
        <CheckCircle className="h-3 w-3 mr-1" />
        Gold: Optimal Level
      </div>
      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse" style={{animationDelay: '0.5s'}}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Silver: Reorder Soon
      </div>
      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse" style={{animationDelay: '1s'}}>
        <Package className="h-3 w-3 mr-1" />
        Diamonds: Critical
      </div>
    </div>
    
    {/* Insights Panel */}
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl">
      <div className="text-xs font-bold text-gray-800 mb-1">AI Insights</div>
      <div className="text-xs text-gray-600">Next shortage: 3 days</div>
      <div className="text-xs text-gray-600">Suggested order: ₹2.4L</div>
    </div>
  </div>
);

export const FinishedGoodsInsight = () => (
  <div className="relative w-80 h-64 mx-auto">
    {/* Finished Goods Warehouse */}
    <div className="absolute bottom-8 left-4 w-72 h-36 bg-gradient-to-t from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
      {/* Product Display */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center animate-pulse" style={{animationDelay: `${i * 0.1}s`}}>
            {i % 3 === 0 && <Diamond className="h-4 w-4 text-white" />}
            {i % 3 === 1 && <Gem className="h-4 w-4 text-white" />}
            {i % 3 === 2 && <Sparkles className="h-4 w-4 text-white" />}
          </div>
        ))}
      </div>
      
      {/* Stock Level Indicators */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Rings</span>
          <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
            <div className="w-16 h-full bg-green-500 animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-green-600">80%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Necklaces</span>
          <div className="w-20 h-2 bg-yellow-200 rounded-full overflow-hidden">
            <div className="w-8 h-full bg-yellow-500 animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-yellow-600">40%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Earrings</span>
          <div className="w-20 h-2 bg-red-200 rounded-full overflow-hidden">
            <div className="w-4 h-full bg-red-500 animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-red-600">20%</span>
        </div>
      </div>
    </div>
    
    {/* AI Insights Eye */}
    <div className="absolute top-4 right-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center animate-pulse">
      <Eye className="h-8 w-8 text-white" />
    </div>
    
    {/* Productivity Metrics */}
    <div className="absolute top-8 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl">
      <div className="flex items-center space-x-2 mb-2">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <span className="text-xs font-bold">Productivity Up</span>
      </div>
      <div className="text-xs text-gray-600">+30% fulfillment speed</div>
      <div className="text-xs text-gray-600">-25% stockouts</div>
    </div>
  </div>
);

export const ProductionOptimizationInsight = () => (
  <div className="relative w-80 h-64 mx-auto">
    {/* Production Flow */}
    <div className="absolute top-8 left-8 w-64 h-12 bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      {/* Material Input */}
      <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
        <Package className="h-4 w-4 text-white" />
      </div>
      {/* Finished Output */}
      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
        <Diamond className="h-4 w-4 text-white" />
      </div>
    </div>
    
    {/* AI Optimization Center */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
      <Lightbulb className="h-10 w-10 text-white" />
    </div>
    
    {/* Efficiency Metrics */}
    <div className="absolute bottom-8 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
      <div className="text-xs font-bold text-gray-800 mb-3">AI Optimization</div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Efficiency:</span>
          <span className="font-bold text-green-600">+50%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Waste Reduction:</span>
          <span className="font-bold text-blue-600">-40%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Output:</span>
          <span className="font-bold text-purple-600">+75%</span>
        </div>
      </div>
    </div>
    
    {/* Production Timeline */}
    <div className="absolute bottom-4 right-4 space-y-1">
      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Order #1234: Complete</div>
      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Order #1235: 75% done</div>
      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Order #1236: Queued</div>
    </div>
  </div>
);
