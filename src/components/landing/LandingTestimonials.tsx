
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const LandingTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      company: "Golden Craft Jewelry",
      quote: "Zarify helped us reduce raw material costs by 35% while improving our finished goods availability.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      metric: "35% cost reduction"
    },
    {
      name: "Michael Rodriguez", 
      company: "Artisan Diamond Works",
      quote: "The material tracking is incredibly accurate. We haven't had a production delay in 6 months.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      metric: "Zero production delays"
    },
    {
      name: "Emily Thompson",
      company: "Heritage Jewelry Co.",
      quote: "Our inventory optimization improved dramatically. We now fulfill orders 50% faster.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      metric: "50% faster fulfillment"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mb-12">
          <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200/50 rounded-full text-xs">
            Success Stories
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Real Results from Real Manufacturers
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group border border-gray-100/50">
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 text-sm leading-relaxed text-center">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-gray-500 text-xs">{testimonial.company}</div>
                  </div>
                </div>
                
                <Badge className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-0 px-2 py-1 rounded-full text-xs">
                  {testimonial.metric}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingTestimonials;
