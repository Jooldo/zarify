
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, TrendingUp, Shield, Clock, BarChart3, Play, CheckCircle, Users, Factory, Gem, Diamond, Sparkles, Award, Target, Globe, Building2, Zap, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Production Intelligence",
      description: "Smart algorithms optimize your jewelry manufacturing process, predict bottlenecks, and automatically adjust production schedules for maximum efficiency.",
      gradient: "from-blue-500 to-purple-600",
      stats: "40% faster production",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* AI Brain Network */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span>
              </div>
            </div>
          </div>
          
          {/* Neural Network Connections */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`absolute w-3 h-3 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full animate-pulse`} 
                 style={{
                   top: `${20 + Math.sin(i * Math.PI / 4) * 80}px`,
                   left: `${160 + Math.cos(i * Math.PI / 4) * 100}px`,
                   animationDelay: `${i * 0.3}s`
                 }}>
              <div className="absolute top-1/2 left-1/2 w-px h-16 bg-gradient-to-b from-purple-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            </div>
          ))}
          
          {/* Production Metrics */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="text-xs font-bold text-gray-800 mb-2">Live AI Insights</div>
            <div className="space-y-2">
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Efficiency: 94%</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span>Quality Score: 99.2%</span>
              </div>
            </div>
          </div>
          
          {/* Floating Data Points */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg animate-bounce flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
        </div>
      )
    },
    {
      title: "Intelligent Material Management",
      description: "Track precious metals, gemstones, and components with AI-driven inventory optimization. Smart alerts prevent stockouts and reduce carrying costs.",
      gradient: "from-emerald-500 to-teal-600",
      stats: "30% cost reduction",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* Smart Warehouse */}
          <div className="absolute bottom-8 left-8 w-64 h-32 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-xl">
            {/* Automated Shelving */}
            <div className="grid grid-cols-4 gap-2 p-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded ${i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}>
                  {i % 4 === 0 && <Gem className="h-3 w-3 text-white m-0.5" />}
                  {i % 4 === 1 && <Diamond className="h-3 w-3 text-white m-0.5" />}
                  {i % 4 === 2 && <Sparkles className="h-3 w-3 text-white m-0.5" />}
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Scanner */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-1 bg-white rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Smart Alerts */}
          <div className="absolute top-8 left-4 space-y-2">
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              Gold: Optimal
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse" style={{animationDelay: '0.5s'}}>
              Silver: Reorder
            </div>
          </div>
          
          {/* Conveyor System */}
          <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce absolute -top-0 left-8"></div>
          </div>
        </div>
      )
    },
    {
      title: "Real-time Production Analytics",
      description: "Comprehensive dashboards powered by machine learning provide actionable insights into production efficiency, quality metrics, and profitability.",
      gradient: "from-orange-500 to-red-600",
      stats: "Real-time insights",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* Holographic Display */}
          <div className="absolute top-4 left-4 w-72 h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-2xl">
            {/* Chart Visualization */}
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-800 mb-2">Production Analytics</div>
              <div className="flex items-end space-x-2 h-16">
                <div className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t animate-pulse h-8"></div>
                <div className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t animate-pulse h-12" style={{animationDelay: '0.2s'}}></div>
                <div className="w-6 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t animate-pulse h-10" style={{animationDelay: '0.4s'}}></div>
                <div className="w-6 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t animate-pulse h-16" style={{animationDelay: '0.6s'}}></div>
                <div className="w-6 bg-gradient-to-t from-red-500 to-red-300 rounded-t animate-pulse h-6" style={{animationDelay: '0.8s'}}></div>
              </div>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/50 rounded-lg p-2">
                <div className="font-bold text-green-600">+25%</div>
                <div className="text-gray-600">Efficiency</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="font-bold text-blue-600">₹2.3M</div>
                <div className="text-gray-600">Revenue</div>
              </div>
            </div>
          </div>
          
          {/* AI Insights Bubble */}
          <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      )
    },
    {
      title: "Quality Control Automation",
      description: "AI-powered quality assurance with computer vision and automated testing ensures every piece meets your exacting standards.",
      gradient: "from-purple-500 to-pink-600",
      stats: "99.8% accuracy",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* Quality Scanner */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-40 h-40 border-4 border-gray-300 rounded-full relative">
            {/* Scanning Ring */}
            <div className="absolute inset-4 border-2 border-blue-500 rounded-full animate-spin">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            </div>
            
            {/* Jewelry Piece Being Scanned */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Diamond className="h-6 w-6 text-white" />
            </div>
          </div>
          
          {/* Quality Metrics */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold">Quality Check</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Clarity:</span>
                <span className="text-green-600 font-bold">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Cut:</span>
                <span className="text-green-600 font-bold">99.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Color:</span>
                <span className="text-green-600 font-bold">97.8%</span>
              </div>
            </div>
          </div>
          
          {/* Pass/Fail Indicator */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      )
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify's AI has transformed our production. We've reduced waste by 40% and our delivery times are 3x faster.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      metric: "40% waste reduction"
    },
    {
      name: "Michael Rodriguez", 
      company: "Artisan Diamond Works",
      quote: "The intelligent inventory management alone has saved us thousands. The AI predictions are incredibly accurate.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      metric: "₹5L+ saved monthly"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "Finally, a system that understands jewelry manufacturing. Our efficiency has doubled with AI-driven insights.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      metric: "2x efficiency gain"
    }
  ];

  const stats = [
    { number: "500+", label: "AI-Powered Manufacturers", icon: Factory },
    { number: "2M+", label: "Smart Orders Processed", icon: BarChart3 },
    { number: "40%", label: "Average Cost Reduction", icon: TrendingUp },
    { number: "99.9%", label: "AI Uptime Guarantee", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating geometric elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500/30 rotate-45 animate-bounce" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-emerald-500/30 rounded-full animate-bounce" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Premium Header */}
      <header className="border-b border-gray-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300">
                <Diamond className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">Zarify</span>
                <div className="text-xs text-gray-500 font-medium">AI-Powered Manufacturing</div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-12">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                AI Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#insights" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Data Insights
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600 font-medium">
                Login
              </Button>
              <Button 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Start Free Trial
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
              <Badge className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200/50 rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Jewelry Manufacturing
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live AI</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-12 leading-tight tracking-tight">
              The Future of
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent relative">
                Jewelry Manufacturing
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20"></div>
              </span>
              is Here
            </h1>
            
            <p className="text-2xl text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
              Transform your jewelry business with AI-powered manufacturing intelligence. 
              Optimize production, predict demand, and automate quality control with 
              cutting-edge artificial intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-medium rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Experience AI Manufacturing
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-200 hover:border-purple-300 px-12 py-6 text-xl font-medium rounded-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch AI Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-12 text-gray-500">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">AI-Powered Insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">24/7 AI Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 relative overflow-hidden">
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

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200/50 rounded-full">
              AI-Powered Features
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Intelligent Manufacturing
              <span className="block bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                at Your Fingertips
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Advanced AI algorithms designed specifically for jewelry manufacturing excellence
            </p>
          </div>
          
          <div className="space-y-40">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}>
                <div className="flex-1">
                  {feature.illustration}
                </div>
                
                <div className="flex-1 space-y-8">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200/50 px-4 py-2 rounded-full">
                    {feature.stats}
                  </Badge>
                  
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-xl text-gray-600 leading-relaxed font-light">
                    {feature.description}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-700 px-8 py-4 rounded-xl font-medium transform hover:scale-105 transition-all duration-300 group"
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200/50 rounded-full">
              Success Stories
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Trusted by Industry
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Leaders Worldwide
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
                      className="w-16 h-16 rounded-full object-cover border-4 border-purple-100 group-hover:scale-110 transition-transform duration-300"
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
      <section className="py-32 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 text-center relative">
          <Badge className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30 rounded-full">
            <Zap className="h-4 w-4 mr-2" />
            Ready for AI Revolution?
          </Badge>
          
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-12 leading-tight">
            Start Your AI Journey
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Today
            </span>
          </h2>
          
          <p className="text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join the future of jewelry manufacturing with AI-powered insights, 
            automated workflows, and intelligent decision-making.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span className="flex items-center">
                Begin AI Transformation
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-12 py-6 text-xl font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Talk to AI Expert
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 text-white/70">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5" />
              <span>Enterprise AI Security</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5" />
              <span>24/7 AI Support</span>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-emerald-600"></div>
        
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Diamond className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">Zarify</span>
                  <div className="text-sm text-gray-400">AI-Powered Manufacturing</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-8 max-w-md">
                Revolutionizing jewelry manufacturing with artificial intelligence, 
                machine learning, and cutting-edge automation technologies.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">AI Solutions</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Production Intelligence</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Quality Automation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Inventory Optimization</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Predictive Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About AI Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">AI Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 Zarify AI. All rights reserved. Powered by artificial intelligence.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">AI Ethics</a>
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
