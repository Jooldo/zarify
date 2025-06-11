
import { Badge } from '@/components/ui/badge';
import { Package, Users, ClipboardList, BarChart3, Settings, Smartphone } from 'lucide-react';

const LandingFeatures = () => {
  const features = [
    {
      icon: Package,
      title: "Raw Material Management",
      description: "Track inventory, automate procurement, manage suppliers with WhatsApp integration",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Settings,
      title: "Production Workflow",
      description: "Kanban-style manufacturing tracking with step-by-step quality control",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: ClipboardList,
      title: "Order Management",
      description: "End-to-end order processing from creation to delivery with customer tracking",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Real-time dashboards, production metrics, and performance analytics",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Manage workers, assign tasks, track productivity across your manufacturing team",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: Smartphone,
      title: "QR Code Tracking",
      description: "Tag-based inventory system with QR codes for complete audit trails",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="py-20 bg-white relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full text-sm">
            Complete Platform
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need to
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Run Your Manufacturing
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            From raw materials to finished jewelry - manage your entire operation in one platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="p-6 hover:bg-gray-50/50 rounded-xl transition-all duration-300 group">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingFeatures;
