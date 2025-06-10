
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, TrendingUp, Shield, Clock, Play, ChevronRight, Zap, CheckCircle, Users, Factory, Diamond, Sparkles, Award, Target, Globe, Building2, Brain, BarChart3, MessageSquare, Bot, Lightbulb, Database, Cpu, Eye, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const aiFeatures = [
    {
      title: "AI Manufacturing Agent",
      description: "Intelligent AI agents that monitor production, predict bottlenecks, and automatically optimize your manufacturing workflow in real-time.",
      gradient: "from-blue-500 to-cyan-600",
      stats: "95% accuracy predictions",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* AI Brain Center */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <Brain className="h-12 w-12 text-white" />
          </div>
          
          {/* Neural Network Connections */}
          <div className="absolute top-16 left-16 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center animate-bounce">
            <Factory className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-16 right-16 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center animate-bounce" style={{animationDelay: '0.5s'}}>
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="absolute bottom-16 left-20 w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center animate-bounce" style={{animationDelay: '1s'}}>
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div className="absolute bottom-16 right-20 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center animate-bounce" style={{animationDelay: '1.5s'}}>
            <Diamond className="h-8 w-8 text-white" />
          </div>
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{zIndex: -1}}>
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line x1="50%" y1="20%" x2="25%" y2="35%" stroke="url(#connectionGradient)" strokeWidth="3" className="animate-pulse" />
            <line x1="50%" y1="20%" x2="75%" y2="35%" stroke="url(#connectionGradient)" strokeWidth="3" className="animate-pulse" style={{animationDelay: '0.5s'}} />
            <line x1="50%" y1="60%" x2="30%" y2="75%" stroke="url(#connectionGradient)" strokeWidth="3" className="animate-pulse" style={{animationDelay: '1s'}} />
            <line x1="50%" y1="60%" x2="70%" y2="75%" stroke="url(#connectionGradient)" strokeWidth="3" className="animate-pulse" style={{animationDelay: '1.5s'}} />
          </svg>
          
          {/* AI Processing Indicators */}
          <div className="absolute top-2 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">AI Active</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Data Insights",
      description: "Advanced analytics powered by machine learning to uncover hidden patterns in your production data and provide actionable business intelligence.",
      gradient: "from-emerald-500 to-teal-600",
      stats: "40% faster decisions",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* Data Dashboard */}
          <div className="absolute top-4 left-4 w-72 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-bold text-gray-800">Live Analytics</span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Dynamic Charts */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t animate-pulse h-16"></div>
                <div className="w-8 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t animate-pulse h-24" style={{animationDelay: '0.2s'}}></div>
                <div className="w-8 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t animate-pulse h-20" style={{animationDelay: '0.4s'}}></div>
                <div className="w-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t animate-pulse h-32" style={{animationDelay: '0.6s'}}></div>
                <div className="w-8 bg-gradient-to-t from-pink-500 to-pink-300 rounded-t animate-pulse h-28" style={{animationDelay: '0.8s'}}></div>
              </div>
              
              {/* AI Insights */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">AI Insight</span>
                </div>
                <p className="text-xs text-blue-600">Peak production at 2 PM daily</p>
              </div>
            </div>
          </div>
          
          {/* Floating AI Indicators */}
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '3s'}}>
            <Cpu className="h-6 w-6 text-white" />
          </div>
          
          <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center animate-bounce">
            <Eye className="h-7 w-7 text-white" />
          </div>
        </div>
      )
    },
    {
      title: "AI-Powered Actions",
      description: "Automated decision-making that takes immediate action based on real-time data - from reordering materials to adjusting production schedules.",
      gradient: "from-purple-500 to-pink-600",
      stats: "90% automation rate",
      illustration: (
        <div className="relative w-80 h-64 mx-auto">
          {/* Action Center */}
          <div className="absolute top-8 left-8 w-64 h-40 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-bold text-gray-800">AI Actions</span>
              </div>
              <Badge className="bg-purple-100 text-purple-700 text-xs">Active</Badge>
            </div>
            
            {/* Action Items */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-800">Gold reordered</p>
                  <p className="text-xs text-green-600">Stock threshold reached</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-800">Schedule optimized</p>
                  <p className="text-xs text-blue-600">Efficiency +15%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <MessageSquare className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-orange-800">Alert sent</p>
                  <p className="text-xs text-orange-600">Quality threshold</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Automation Gears */}
          <div className="absolute top-4 right-4 w-16 h-16 border-4 border-gray-300 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '4s'}}>
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full"></div>
          </div>
          
          <div className="absolute bottom-8 right-8 w-12 h-12 border-3 border-purple-400 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}}>
            <div className="w-6 h-6 border-2 border-purple-500 rounded-full"></div>
          </div>
        </div>
      )
    }
  ];

  const manufacturingProcess = [
    {
      title: "Raw Material Intelligence",
      description: "AI tracks inventory levels, predicts shortages, and automatically triggers procurement orders",
      time: "Real-time",
      completion: 95
    },
    {
      title: "Smart Production Planning", 
      description: "Machine learning optimizes production schedules based on order priority and resource availability",
      time: "Continuous",
      completion: 88
    },
    {
      title: "Quality Assurance AI",
      description: "Computer vision and sensors monitor quality at every stage with instant alerts",
      time: "Live monitoring",
      completion: 97
    },
    {
      title: "Intelligent Delivery",
      description: "AI coordinates logistics, tracks shipments, and predicts delivery times with 99% accuracy",
      time: "End-to-end",
      completion: 92
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify's AI agents transformed our production. We've reduced waste by 30% and our AI assistant handles 80% of routine decisions automatically.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      metric: "30% waste reduction"
    },
    {
      name: "Michael Rodriguez", 
      company: "Artisan Diamond Works",
      quote: "The AI insights showed us patterns we never noticed. Our inventory management is now fully automated and saves us ₹2L monthly.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      metric: "₹2L monthly savings"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "The AI manufacturing agent is like having a production expert working 24/7. Our efficiency doubled and quality improved significantly.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      metric: "2x efficiency gain"
    }
  ];

  const stats = [
    { number: "500+", label: "AI-Powered Manufacturers", trend: "+180%" },
    { number: "2M+", label: "AI Decisions Made", trend: "+420%" },
    { number: "95%", label: "Automation Rate", trend: "Industry leading" },
    { number: "40%", label: "Cost Reduction", trend: "Average savings" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Neural Network Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Cline x1='30' y1='10' x2='30' y2='20' stroke='%236366f1' stroke-width='1'/%3E%3Cline x1='30' y1='40' x2='30' y2='50' stroke='%236366f1' stroke-width='1'/%3E%3Cline x1='10' y1='30' x2='20' y2='30' stroke='%236366f1' stroke-width='1'/%3E%3Cline x1='40' y1='30' x2='50' y2='30' stroke='%236366f1' stroke-width='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'drift 30s linear infinite'
          }}></div>
        </div>
      </div>

      {/* Premium Header */}
      <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center space-x-4 animate-fade-in">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <Diamond className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Zarify</span>
                <div className="text-xs text-gray-500 -mt-1">AI Manufacturing Platform</div>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-10">
              <a href="#ai-features" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                AI Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#manufacturing" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Manufacturing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex text-gray-600 hover:text-purple-600 font-medium">
                Login
              </Button>
              <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl px-6 py-3 font-semibold">
                Start AI Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8">
              <Badge className="px-6 py-3 bg-purple-100 text-purple-700 text-lg font-semibold animate-pulse border-purple-200">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Manufacturing Platform
              </Badge>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-12 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI Transforms
              </span>
              <br />
              Jewelry Manufacturing
            </h1>
            
            <p className="text-2xl text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto">
              Experience the future of jewelry manufacturing with AI agents that think, learn, and optimize your entire production process. From intelligent inventory management to predictive quality control.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Deploy AI Agents
                  <Zap className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
              
              <Button variant="outline" size="lg" className="px-12 py-6 text-xl border-2 border-purple-200 hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 font-semibold group">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                See AI in Action
              </Button>
            </div>
            
            {/* Hero Illustration - AI Manufacturing Scene */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-3xl p-12 shadow-2xl border border-purple-100">
                {/* Central AI Hub */}
                <div className="relative">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                  
                  {/* Manufacturing Stations Connected to AI */}
                  <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center animate-bounce">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Factory className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Smart Production</p>
                    </div>
                    
                    <div className="text-center animate-bounce" style={{animationDelay: '0.5s'}}>
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <BarChart3 className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">AI Analytics</p>
                    </div>
                    
                    <div className="text-center animate-bounce" style={{animationDelay: '1s'}}>
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Shield className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Quality AI</p>
                    </div>
                    
                    <div className="text-center animate-bounce" style={{animationDelay: '1.5s'}}>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Diamond className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Precision Control</p>
                    </div>
                  </div>
                  
                  {/* AI Activity Indicators */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-gray-800">AI Systems Active</span>
                    </div>
                    <div className="text-xs text-gray-600">Processing 847 data points/sec</div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">95%</div>
                      <div className="text-xs text-gray-600">Automation Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in group" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="text-5xl md:text-6xl font-bold text-white mb-3 hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-white/90 font-semibold mb-2 text-lg">{stat.label}</div>
                <div className="text-white/70 text-sm flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-purple-100 text-purple-700 text-lg font-semibold">
              <Brain className="h-5 w-5 mr-2" />
              Artificial Intelligence Features
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
              AI That Actually <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Revolutionary AI agents that understand jewelry manufacturing and take intelligent action
            </p>
          </div>
          
          <div className="space-y-32">
            {aiFeatures.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 animate-fade-in`} style={{animationDelay: `${index * 0.3}s`}}>
                <div className="flex-1">
                  {feature.illustration}
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <Badge className={`mb-6 px-4 py-2 bg-gradient-to-r ${feature.gradient} text-white font-semibold`}>
                    {feature.stats}
                  </Badge>
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{feature.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">{feature.description}</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 text-lg font-semibold">
                    Explore Feature
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process Section */}
      <section id="manufacturing" className="py-32 bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-emerald-100 text-emerald-700 text-lg font-semibold">
              <Factory className="h-5 w-5 mr-2" />
              Intelligent Manufacturing
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
              End-to-End <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">AI Automation</span>
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Every stage of your manufacturing process enhanced by artificial intelligence
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {manufacturingProcess.map((process, index) => (
              <div key={index} className="relative mb-16 last:mb-0">
                {/* Progress Line */}
                {index < manufacturingProcess.length - 1 && (
                  <div className="absolute left-8 top-20 w-1 h-32 bg-gradient-to-b from-purple-300 to-purple-500 rounded-full"></div>
                )}
                
                <div className="flex items-start space-x-8 animate-slide-up" style={{animationDelay: `${index * 0.3}s`}}>
                  {/* Step Indicator */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{process.title}</h3>
                      <Badge className="bg-purple-100 text-purple-700">{process.time}</Badge>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">{process.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">AI Automation Level</span>
                      <span className="text-sm font-bold text-purple-600">{process.completion}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" 
                        style={{width: `${process.completion}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-24">
            <Badge className="mb-8 px-6 py-3 bg-blue-100 text-blue-700 text-lg font-semibold">
              <Users className="h-5 w-5 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
              AI-Powered <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Results</span>
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed">
              See how our AI agents are transforming jewelry businesses worldwide
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative group animate-slide-up" style={{animationDelay: `${index * 0.3}s`}}>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="flex mb-8">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg text-gray-700 mb-8 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-purple-100"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold">
                    {testimonial.metric}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30 text-lg font-semibold">
              <Zap className="h-5 w-5 mr-2" />
              Ready for AI Revolution?
            </Badge>
            
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Deploy AI Agents
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Today
              </span>
            </h2>
            
            <p className="text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed">
              Join the AI manufacturing revolution. Start with our intelligent agents and watch your jewelry business transform with unprecedented automation and insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-16 py-8 text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <span className="flex items-center">
                  Launch AI Platform
                  <Brain className="ml-3 h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center items-center gap-12 text-white/80 text-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6" />
                <span>24/7 AI Monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6" />
                <span>No Setup Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Diamond className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Zarify</span>
                  <div className="text-sm text-gray-400">AI Manufacturing Platform</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                Empowering jewelry manufacturers with revolutionary AI agents that think, learn, and optimize every aspect of production for the digital age.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">AI Platform</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  AI Agents
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Data Insights
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Automation
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Analytics
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-8 text-lg">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  About AI
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Research
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
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0 text-lg">
                © 2024 Zarify AI. All rights reserved. Revolutionizing manufacturing with artificial intelligence.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Terms</a>
                <a href="#" className="hover:text-white transition-colors duration-300">AI Ethics</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
