
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield, Clock, BarChart3, Gem, Diamond, Sparkles, Award, Target, Zap, Play, ChevronRight, Globe, Layers, Building2, Factory, Cpu, Database, Cloud, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Smart Inventory Management",
      description: "Track raw materials, finished goods, and work-in-progress with real-time visibility across your entire jewelry manufacturing operation.",
      gradient: "from-blue-500 to-purple-600",
      stats: "40% reduction in material waste"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Order Management",
      description: "Streamline custom orders, manage customer relationships, and track production timelines from concept to delivery.",
      gradient: "from-green-500 to-teal-600",
      stats: "3x faster order processing"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Production Analytics",
      description: "Get insights into production efficiency, material costs, and profit margins to optimize your jewelry manufacturing business.",
      gradient: "from-orange-500 to-red-600",
      stats: "25% increase in efficiency"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Quality Control",
      description: "Maintain consistent quality standards with built-in checkpoints and quality assurance workflows.",
      gradient: "from-purple-500 to-pink-600",
      stats: "99.8% quality compliance"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Tracking",
      description: "Monitor every stage of production with live updates and automated notifications for your jewelry manufacturing process.",
      gradient: "from-cyan-500 to-blue-600",
      stats: "Real-time updates"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Compliance Ready",
      description: "Meet industry standards and regulations with built-in compliance tools specifically designed for jewelry manufacturers.",
      gradient: "from-emerald-500 to-green-600",
      stats: "100% regulatory compliant"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify transformed our production process. We've reduced waste by 30% and improved delivery times significantly.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      revenue: "₹2.5M+ processed"
    },
    {
      name: "Michael Rodriguez",
      company: "Artisan Diamond Works",
      quote: "The inventory management features alone have saved us thousands in material costs. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      revenue: "40% cost reduction"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "Finally, a system that understands the complexity of jewelry manufacturing. Our efficiency has doubled.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      revenue: "2x faster delivery"
    }
  ];

  const stats = [
    { number: "500+", label: "Jewelry Manufacturers", icon: <Diamond className="h-6 w-6" />, growth: "+125%" },
    { number: "2M+", label: "Orders Processed", icon: <Target className="h-6 w-6" />, growth: "+340%" },
    { number: "40%", label: "Average Cost Reduction", icon: <TrendingUp className="h-6 w-6" />, growth: "Avg. savings" },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Shield className="h-6 w-6" />, growth: "SLA" }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Design & Planning",
      description: "Create detailed designs and production plans with our intuitive tools",
      icon: <Sparkles className="h-8 w-8" />,
      color: "text-blue-500",
      time: "Minutes"
    },
    {
      step: "02", 
      title: "Material Sourcing",
      description: "Track and manage raw materials with automated procurement workflows",
      icon: <Gem className="h-8 w-8" />,
      color: "text-emerald-500",
      time: "Hours"
    },
    {
      step: "03",
      title: "Production",
      description: "Monitor manufacturing progress with real-time updates and quality checkpoints",
      icon: <Award className="h-8 w-8" />,
      color: "text-purple-500",
      time: "Days"
    },
    {
      step: "04",
      title: "Delivery",
      description: "Complete orders with automated invoicing and customer notifications",
      icon: <Zap className="h-8 w-8" />,
      color: "text-orange-500",
      time: "On-time"
    }
  ];

  const integrations = [
    { name: "WhatsApp", logo: "💬", description: "Real-time notifications" },
    { name: "Payment Gateway", logo: "💳", description: "Secure transactions" },
    { name: "Analytics", logo: "📊", description: "Business insights" },
    { name: "Cloud Storage", logo: "☁️", description: "Secure data backup" },
    { name: "API Access", logo: "🔗", description: "Custom integrations" },
    { name: "Mobile App", logo: "📱", description: "On-the-go access" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-purple-500/20 rotate-45 animate-bounce" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-emerald-500/20 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
      </div>

      {/* Enhanced Header */}
      <header className="border-b bg-white/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Diamond className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Zarify</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105 relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#process" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105 relative group">
                Process
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105 relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#integrations" className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105 relative group">
                Integrations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex text-gray-600 hover:text-primary">
                Login
              </Button>
              <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-purple-50 py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-left animate-slide-up">
              <div className="flex items-center space-x-2 mb-6">
                <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 animate-pulse">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Trusted by 500+ Jewelry Manufacturers
                </Badge>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent block relative">
                  Jewelry Business
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full transform scale-x-0 animate-pulse" style={{animationDelay: '1s', animation: 'scale-x 2s ease-out 1s forwards'}}></div>
                </span>
                with AI-Powered Manufacturing
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
                From raw materials to finished masterpieces, Zarify provides comprehensive management tools designed specifically for jewelry manufacturers. Optimize production, reduce costs by 40%, and scale your business with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/app')}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white px-10 py-6 text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Button>
                
                <Button variant="outline" size="lg" className="px-10 py-6 text-xl border-2 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300 group">
                  <Play className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Setup in minutes</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Hero Illustration */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="relative">
                {/* Main Dashboard with enhanced design */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Live</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Dashboard Header */}
                  <div className="border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Diamond className="h-5 w-5 mr-2 text-primary" />
                          Zarify Dashboard
                        </h3>
                        <p className="text-sm text-gray-500">Real-time jewelry manufacturing overview</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₹45.2L</p>
                        <p className="text-xs text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12.5% this month
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats Cards */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium mb-1">Active Orders</p>
                          <p className="text-3xl font-bold text-blue-700">247</p>
                          <p className="text-xs text-blue-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +18 today
                          </p>
                        </div>
                        <div className="bg-blue-200 p-3 rounded-xl">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-600 font-medium mb-1">Completed</p>
                          <p className="text-3xl font-bold text-emerald-700">156</p>
                          <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            98% on-time
                          </p>
                        </div>
                        <div className="bg-emerald-200 p-3 rounded-xl">
                          <TrendingUp className="h-8 w-8 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Production Pipeline */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-800">Production Pipeline</h4>
                      <Badge className="bg-primary/10 text-primary text-xs">Live Updates</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Ring Collection - Gold</span>
                            <span className="text-xs text-gray-500">75%</span>
                          </div>
                          <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: '75%'}}></div>
                          </div>
                        </div>
                        <Factory className="h-4 w-4 text-blue-500" />
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Diamond Earrings</span>
                            <span className="text-xs text-gray-500">90%</span>
                          </div>
                          <div className="bg-emerald-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000" style={{width: '90%'}}></div>
                          </div>
                        </div>
                        <Gem className="h-4 w-4 text-emerald-500" />
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Custom Necklace</span>
                            <span className="text-xs text-gray-500">45%</span>
                          </div>
                          <div className="bg-purple-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" style={{width: '45%'}}></div>
                          </div>
                        </div>
                        <Award className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                  <Diamond className="h-10 w-10 text-white" />
                </div>
                
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <Gem className="h-8 w-8 text-white" />
                </div>
                
                <div className="absolute top-1/3 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Animated Stats Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'drift 20s linear infinite'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-white/80">
              Join the revolution in jewelry manufacturing
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in group" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-white/90 font-medium mb-2">{stat.label}</div>
                <div className="text-white/70 text-sm flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.growth}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Process Section */}
      <section id="process" className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary">
              Streamlined Workflow
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              From Concept to <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Creation</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Follow your jewelry through every step of production with our intelligent manufacturing process
            </p>
          </div>
          
          <div className="relative">
            {/* Enhanced Process Flow */}
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connecting line with animation */}
              <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-purple-600/30 to-primary/30">
                <div className="h-full bg-gradient-to-r from-primary to-purple-600 animate-pulse"></div>
              </div>
              
              {processSteps.map((step, index) => (
                <div key={index} className="relative animate-slide-up group" style={{animationDelay: `${index * 0.3}s`}}>
                  <div className="relative z-10 text-center">
                    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
                      {/* Outer ring with animation */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full group-hover:scale-110 transition-all duration-500 animate-pulse"></div>
                      
                      {/* Inner circle */}
                      <div className={`relative w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center ${step.color} group-hover:scale-110 transition-all duration-300 border-2 border-gray-100`}>
                        {step.icon}
                      </div>
                      
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-all duration-300">
                        {step.step}
                      </div>
                      
                      {/* Time indicator */}
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="text-xs bg-gray-100 text-gray-600 border-0">
                          {step.time}
                        </Badge>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-50/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <Badge className="mb-6 px-4 py-2 bg-emerald-100 text-emerald-700">
              Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Everything You Need to <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Scale</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Comprehensive tools designed specifically for the unique challenges of jewelry manufacturing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in bg-white/80 backdrop-blur-sm" style={{animationDelay: `${index * 0.2}s`}}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
                    <div className="relative z-10">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </CardDescription>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {feature.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Integrations Section */}
      <section id="integrations" className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <Badge className="mb-6 px-4 py-2 bg-blue-100 text-blue-700">
              Seamless Integrations
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Connect Everything <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Together</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Integrate with your favorite tools and services for a complete business solution
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {integration.logo}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-100/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <Badge className="mb-6 px-4 py-2 bg-purple-100 text-purple-700">
              Customer Success
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Loved by <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Manufacturers</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              See how Zarify is transforming jewelry businesses across the globe
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm animate-slide-up group" style={{animationDelay: `${index * 0.3}s`}}>
                <CardContent className="pt-8">
                  <div className="flex mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-8 italic text-lg leading-relaxed text-center">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-primary/20 group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="text-left">
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      {testimonial.revenue}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30">
              <Zap className="h-4 w-4 mr-2" />
              Ready to Transform?
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Start Your Jewelry
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Revolution Today
              </span>
            </h2>
            
            <p className="text-2xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of jewelry manufacturers who have streamlined their operations with Zarify. Start your free trial today and see the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-white text-primary hover:bg-gray-100 px-12 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <span className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
              
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary px-12 py-6 text-xl font-bold transform hover:scale-105 transition-all duration-300 group">
                <Users className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Contact Sales
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Diamond className="h-7 w-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Zarify</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                Empowering jewelry manufacturers with smart, efficient management solutions for the digital age. Transform your business with AI-powered insights.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Features
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Pricing
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Security
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Integrations
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  About
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Blog
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Careers
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Contact
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Help Center
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Documentation
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  API Reference
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Status
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 Zarify. All rights reserved. Built with ❤️ for jewelry manufacturers.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
