
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, BarChart3, Package, Users, Wrench, Star, Quote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Redirect authenticated users to the app
  if (user) {
    navigate('/app');
    return null;
  }

  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Track raw materials, finished goods, and manage stock levels with automated alerts for jewelry manufacturing.",
    },
    {
      icon: BarChart3,
      title: "Production Analytics",
      description: "Monitor manufacturing workflows, track order progress, and optimize production efficiency.",
    },
    {
      icon: Users,
      title: "Supplier & Worker Management",
      description: "Manage supplier relationships, procurement requests, and coordinate your manufacturing team.",
    },
    {
      icon: Wrench,
      title: "Manufacturing Workflow",
      description: "Streamline production processes from raw materials to finished jewelry pieces.",
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      company: "Golden Heritage Jewelers",
      quote: "Zarify transformed our inventory management. We reduced material waste by 30% and improved delivery times significantly.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      company: "Artisan Craft Jewellery",
      quote: "The production workflow features helped us scale from 50 to 200 orders per month while maintaining quality.",
      rating: 5
    }
  ];

  const benefits = [
    "Reduce material waste and optimize inventory",
    "Track orders from creation to delivery",
    "Manage supplier relationships efficiently",
    "Coordinate manufacturing workflows",
    "Generate insights and analytics",
    "Scale production operations"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Zarify</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            For Jewelry Manufacturers
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your
            <span className="text-primary block">Jewelry Manufacturing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Complete order management system designed specifically for jewelry manufacturers. 
            Track inventory, manage production, and scale your operations with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Jewelry Business
            </h2>
            <p className="text-lg text-gray-600">
              Built specifically for the unique challenges of jewelry manufacturing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 ${
                    activeFeature === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  } transition-colors`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Jewelry Manufacturers Choose Zarify
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Jewelry Manufacturers
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.company}</div>
                    </div>
                    <div className="flex space-x-1 ml-auto">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Jewelry Manufacturing?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of jewelry manufacturers who trust Zarify to manage their operations.
            Start your free trial today.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-2xl font-bold">Zarify</span>
          </div>
          <p className="text-gray-400 mb-4">
            Streamlining jewelry manufacturing operations worldwide
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Zarify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
