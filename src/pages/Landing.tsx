
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield, Clock, BarChart3, Gem, Diamond, Sparkles, Award, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Smart Inventory Management",
      description: "Track raw materials, finished goods, and work-in-progress with real-time visibility across your entire jewelry manufacturing operation.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Order Management",
      description: "Streamline custom orders, manage customer relationships, and track production timelines from concept to delivery.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Production Analytics",
      description: "Get insights into production efficiency, material costs, and profit margins to optimize your jewelry manufacturing business.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Quality Control",
      description: "Maintain consistent quality standards with built-in checkpoints and quality assurance workflows.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Tracking",
      description: "Monitor every stage of production with live updates and automated notifications for your jewelry manufacturing process.",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Compliance Ready",
      description: "Meet industry standards and regulations with built-in compliance tools specifically designed for jewelry manufacturers.",
      gradient: "from-emerald-500 to-green-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify transformed our production process. We've reduced waste by 30% and improved delivery times significantly.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Rodriguez",
      company: "Artisan Diamond Works",
      quote: "The inventory management features alone have saved us thousands in material costs. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "Finally, a system that understands the complexity of jewelry manufacturing. Our efficiency has doubled.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "500+", label: "Jewelry Manufacturers", icon: <Diamond className="h-6 w-6" /> },
    { number: "2M+", label: "Orders Processed", icon: <Target className="h-6 w-6" /> },
    { number: "40%", label: "Average Cost Reduction", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Shield className="h-6 w-6" /> }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Design & Planning",
      description: "Create detailed designs and production plans with our intuitive tools",
      icon: <Sparkles className="h-8 w-8" />,
      color: "text-blue-500"
    },
    {
      step: "02", 
      title: "Material Sourcing",
      description: "Track and manage raw materials with automated procurement workflows",
      icon: <Gem className="h-8 w-8" />,
      color: "text-emerald-500"
    },
    {
      step: "03",
      title: "Production",
      description: "Monitor manufacturing progress with real-time updates and quality checkpoints",
      icon: <Award className="h-8 w-8" />,
      color: "text-purple-500"
    },
    {
      step: "04",
      title: "Delivery",
      description: "Complete orders with automated invoicing and customer notifications",
      icon: <Zap className="h-8 w-8" />,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Diamond className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Zarify</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105">Features</a>
              <a href="#process" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105">Process</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105">Contact</a>
            </nav>
            <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-purple-50 py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left animate-slide-up">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/20 bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 500+ Jewelry Manufacturers
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Streamline Your 
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent block">
                  Jewelry Manufacturing
                </span>
                Operations
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                From raw materials to finished pieces, Zarify provides comprehensive management tools designed specifically for jewelry manufacturers. Optimize production, reduce costs, and scale your business with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/app')}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300">
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="relative">
                {/* Main Dashboard Screenshot Mockup */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  {/* Dashboard Header */}
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Zarify Dashboard</h3>
                    <p className="text-sm text-gray-500">Real-time jewelry manufacturing overview</p>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Active Orders</p>
                          <p className="text-2xl font-bold text-blue-700">247</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-600 font-medium">Revenue</p>
                          <p className="text-2xl font-bold text-emerald-700">₹12.5L</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Production Chart Mockup */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Production Pipeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 bg-blue-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">75%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="flex-1 bg-emerald-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">60%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1 bg-purple-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">90%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Diamond className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Gem className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Streamlined <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Manufacturing Process</span>
            </h2>
            <p className="text-xl text-gray-600">
              From concept to creation, follow your jewelry through every step of production
            </p>
          </div>
          
          <div className="relative">
            {/* Process Flow */}
            <div className="grid md:grid-cols-4 gap-8 relative">
              {processSteps.map((step, index) => (
                <div key={index} className="relative animate-slide-up" style={{animationDelay: `${index * 0.3}s`}}>
                  {/* Connection Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-purple-600/30 z-0"></div>
                  )}
                  
                  <div className="relative z-10 text-center group">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-full group-hover:scale-110 transition-transform duration-300`}></div>
                      <div className={`relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                        {step.icon}
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Run Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Jewelry Business</span>
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed specifically for the unique challenges of jewelry manufacturing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Leading <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Jewelry Manufacturers</span>
            </h2>
            <p className="text-xl text-gray-600">
              See how Zarify is transforming jewelry businesses across the globe
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-sm animate-slide-up" style={{animationDelay: `${index * 0.3}s`}}>
                <CardContent className="pt-8">
                  <div className="flex mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-8 italic text-lg leading-relaxed text-center">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Transform Your Jewelry Manufacturing?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of jewelry manufacturers who have streamlined their operations with Zarify. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-white text-primary hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Diamond className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Zarify</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering jewelry manufacturers with smart, efficient management solutions for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Zarify. All rights reserved. Built with ❤️ for jewelry manufacturers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
