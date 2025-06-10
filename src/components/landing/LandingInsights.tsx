
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { RawMaterialInsight, FinishedGoodsInsight, ProductionOptimizationInsight } from './InsightIllustrations';

const LandingInsights = () => {
  const insights = [
    {
      title: "Raw Material Intelligence",
      description: "AI analyzes your raw material consumption patterns, predicts shortages, and recommends optimal stock levels to prevent production delays.",
      gradient: "from-emerald-500 to-teal-600",
      stats: "40% reduction in material waste",
      illustration: <RawMaterialInsight />
    },
    {
      title: "Finished Goods Analytics",
      description: "Track inventory levels, monitor production completion rates, and get AI-powered recommendations for optimal stock management.",
      gradient: "from-purple-500 to-pink-600",
      stats: "30% faster order fulfillment",
      illustration: <FinishedGoodsInsight />
    },
    {
      title: "Production Optimization",
      description: "AI connects raw material availability with finished goods demand to optimize production schedules and maximize efficiency.",
      gradient: "from-blue-500 to-purple-600",
      stats: "50% productivity increase",
      illustration: <ProductionOptimizationInsight />
    }
  ];

  return (
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
  );
};

export default LandingInsights;
