
import { Factory, TrendingUp, Package, BarChart3 } from 'lucide-react';

const LandingStats = () => {
  const stats = [
    { number: "500+", label: "Jewelry Manufacturers Using AI Insights", icon: Factory },
    { number: "40%", label: "Average Raw Material Waste Reduction", icon: TrendingUp },
    { number: "60%", label: "Improvement in Stock Availability", icon: Package },
    { number: "50%", label: "Increase in Production Efficiency", icon: BarChart3 }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-5xl md:text-6xl font-bold text-white mb-3">{stat.number}</div>
              <div className="text-white/90 font-medium text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
