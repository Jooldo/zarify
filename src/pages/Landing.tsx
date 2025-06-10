
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, TrendingUp, Shield, Clock, BarChart3, Play, CheckCircle, Users, Factory, Gem, Diamond, Sparkles, Award, Target, Globe, Building2, Zap, ArrowUpRight, Package, AlertTriangle, Eye, Brain, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const insights = [
    {
      title: "Raw Material Intelligence",
      description: "AI analyzes your raw material consumption patterns, predicts shortages, and recommends optimal stock levels to prevent production delays.",
      gradient: "from-emerald-500 to-teal-600",
      stats: "40% reduction in material waste",
      illustration: (
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
      )
    },
    {
      title: "Finished Goods Analytics",
      description: "Track inventory levels, monitor production completion rates, and get AI-powered recommendations for optimal stock management.",
      gradient: "from-purple-500 to-pink-600",
      stats: "30% faster order fulfillment",
      illustration: (
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
      )
    },
    {
      title: "Production Optimization",
      description: "AI connects raw material availability with finished goods demand to optimize production schedules and maximize efficiency.",
      gradient: "from-blue-500 to-purple-600",
      stats: "50% productivity increase",
      illustration: (
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
      )
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify's AI insights helped us reduce raw material costs by 35% while improving our finished goods availability by 60%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      metric: "35% cost reduction"
    },
    {
      name: "Michael Rodriguez", 
      company: "Artisan Diamond Works",
      quote: "The AI predictions for material shortages are incredibly accurate. We haven't had a production delay in 6 months.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      metric: "Zero production delays"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "Our finished goods inventory optimization improved dramatically. We now fulfill orders 50% faster with perfect stock levels.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      metric: "50% faster fulfillment"
    }
  ];

  const stats = [
    { number: "500+", label: "Jewelry Manufacturers Using AI Insights", icon: Factory },
    { number: "40%", label: "Average Raw Material Waste Reduction", icon: TrendingUp },
    { number: "60%", label: "Improvement in Stock Availability", icon: Package },
    { number: "50%", label: "Increase in Production Efficiency", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-100/50 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300">
                <Diamond className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Zarify</span>
                <div className="text-xs text-gray-500 font-medium">AI-Powered Material & Inventory Intelligence</div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-12">
              <a href="#insights" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
                AI Insights
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
                Benefits
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 font-medium relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-emerald-600 font-medium">
                Login
              </Button>
              <Button 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Try AI Insights
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Badge className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered Material & Inventory Intelligence
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live AI Insights</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-12 leading-tight tracking-tight">
              Smart Insights for
              <span className="block bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent relative">
                Raw Materials &
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 bg-clip-text text-transparent">
                Finished Goods
              </span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
              Zarify uses AI to analyze your raw material consumption and finished goods inventory, 
              providing actionable insights that increase productivity by up to 50% and reduce waste by 40%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-medium rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Start Getting AI Insights
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-200 hover:border-emerald-300 px-12 py-6 text-xl font-medium rounded-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                See AI in Action
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-12 text-gray-500">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Real-time Material Insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-blue-500" />
                <span className="font-medium">AI-Powered Predictions</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Productivity Optimization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* AI Insights Section */}
      <section id="insights" className="py-32 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
              AI-Powered Intelligence
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Intelligent Insights for
              <span className="block bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                Maximum Productivity
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              AI analyzes your material consumption patterns and inventory levels to provide actionable insights
            </p>
          </div>
          
          <div className="space-y-40">
            {insights.map((insight, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}>
                <div className="flex-1">
                  {insight.illustration}
                </div>
                
                <div className="flex-1 space-y-8">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200/50 px-4 py-2 rounded-full">
                    {insight.stats}
                  </Badge>
                  
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {insight.title}
                  </h3>
                  
                  <p className="text-xl text-gray-600 leading-relaxed font-light">
                    {insight.description}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="border-2 border-emerald-200 hover:border-emerald-400 text-emerald-600 hover:text-emerald-700 px-8 py-4 rounded-xl font-medium transform hover:scale-105 transition-all duration-300 group"
                  >
                    Learn More
                    <ArrowUpRight className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-32 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
              Proven Results
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Measurable Impact on
              <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Your Bottom Line
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-16 w-16 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Reduce Material Waste</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                AI insights help you order the right materials at the right time, reducing waste by up to 40%
              </p>
              <div className="text-5xl font-bold text-emerald-600">40%</div>
              <div className="text-gray-500 font-medium">Average Waste Reduction</div>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Increase Productivity</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                Optimize production schedules based on material availability and demand forecasts
              </p>
              <div className="text-5xl font-bold text-blue-600">50%</div>
              <div className="text-gray-500 font-medium">Productivity Increase</div>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Improve Stock Levels</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                Maintain optimal inventory levels to fulfill orders faster without overstocking
              </p>
              <div className="text-5xl font-bold text-purple-600">60%</div>
              <div className="text-gray-500 font-medium">Better Stock Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200/50 rounded-full">
              Success Stories
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Real Results from
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Real Manufacturers
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 group border border-gray-100/50">
                <div className="flex justify-center mb-8">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-10 text-lg leading-relaxed font-light text-center">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-emerald-100 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-0 px-4 py-2 rounded-full">
                    {testimonial.metric}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 text-center relative">
          <Badge className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30 rounded-full">
            <Brain className="h-4 w-4 mr-2" />
            Ready for AI-Powered Insights?
          </Badge>
          
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-12 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Material Intelligence
            </span>
          </h2>
          
          <p className="text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Start getting AI-powered insights into your raw materials and finished goods inventory. 
            Increase productivity by 50% and reduce waste by 40%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span className="flex items-center">
                Start Getting AI Insights
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-12 py-6 text-xl font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Talk to Expert
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 text-white/70">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5" />
              <span>24/7 AI Monitoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <span>No Setup Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-purple-600"></div>
        
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Diamond className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Zarify</span>
                  <div className="text-sm text-gray-400">AI-Powered Material Intelligence</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-8 max-w-md">
                Transforming jewelry manufacturing with AI-powered insights into 
                raw materials and finished goods for maximum productivity.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">AI Insights</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Material Intelligence</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Inventory Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Production Optimization</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Predictive Insights</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">AI Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 Zarify. All rights reserved. Powered by AI for jewelry manufacturing.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
