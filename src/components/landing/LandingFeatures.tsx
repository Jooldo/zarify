
import { Badge } from '@/components/ui/badge';
import { Package, Users, ClipboardList, BarChart3, Settings, Smartphone } from 'lucide-react';

const LandingFeatures = () => {
  const features = [
    {
      icon: Package,
      title: "Raw Material Management",
      description: "Track inventory, automate procurement, manage suppliers with WhatsApp integration",
      color: "text-emerald-600"
    },
    {
      icon: Settings,
      title: "Production Workflow",
      description: "Kanban-style manufacturing tracking with step-by-step quality control",
      color: "text-blue-600"
    },
    {
      icon: ClipboardList,
      title: "Order Management",
      description: "End-to-end order processing from creation to delivery with customer tracking",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Real-time dashboards, production metrics, and performance analytics",
      color: "text-orange-600"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Manage workers, assign tasks, track productivity across your manufacturing team",
      color: "text-pink-600"
    },
    {
      icon: Smartphone,
      title: "QR Code Tracking",
      description: "Tag-based inventory system with QR codes for complete audit trails",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="py-16 bg-white relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full text-xs">
            Complete Platform
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight text-left">
            Everything You Need to Run <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Your Manufacturing</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            From raw materials to finished jewelry - manage your entire operation in one platform
          </p>
        </div>
        
        <div className="max-w-4xl relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-purple-200 hidden md:block"></div>
          
          <div className="space-y-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-start space-x-6 group animate-fade-in"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  {/* Animated Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-emerald-300">
                      <IconComponent 
                        className={`h-6 w-6 ${feature.color} transition-all duration-500 group-hover:scale-125 group-hover:rotate-6`} 
                      />
                    </div>
                    {/* Timeline dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full border-2 border-white shadow-sm hidden md:block"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="group-hover:translate-x-2 transition-transform duration-300">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {feature.title}:
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFeatures;
