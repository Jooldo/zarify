
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  FileText, 
  BarChart3, 
  Factory,
  UserCheck,
  Book
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track raw materials and finished goods with real-time stock levels and automated alerts.',
  },
  {
    icon: ShoppingBag,
    title: 'Order Management',
    description: 'Streamline your order process from creation to fulfillment with complete tracking.',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Maintain detailed customer profiles and track order history and preferences.',
  },
  {
    icon: FileText,
    title: 'Invoice Generation',
    description: 'Create professional invoices automatically and track payment status.',
  },
  {
    icon: Factory,
    title: 'Production Planning',
    description: 'Plan and optimize your production schedules with resource allocation.',
  },
  {
    icon: UserCheck,
    title: 'Workforce Management',
    description: 'Manage your team, track performance, and assign tasks efficiently.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Get insights into your business with comprehensive reports and analytics.',
  },
  {
    icon: Book,
    title: 'Product Catalogues',
    description: 'Create beautiful product catalogues to showcase your offerings to customers.',
  },
];

const LandingFeatures = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive business management platform provides all the tools you need 
            to streamline operations, increase efficiency, and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
