
import { Factory, TrendingUp, Package, BarChart3 } from 'lucide-react';

const LandingStats = () => {
  const stats = [
    { number: "500+", label: "Jewelry Manufacturers Using Platform", icon: Factory },
    { number: "40%", label: "Average Raw Material Waste Reduction", icon: TrendingUp },
    { number: "60%", label: "Improvement in Stock Availability", icon: Package },
    { number: "50%", label: "Increase in Production Efficiency", icon: BarChart3 }
  ];

  return (
    <div className="py-16 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/90 font-medium text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingStats;
