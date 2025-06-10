
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const LandingTestimonials = () => {
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

  return (
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
  );
};

export default LandingTestimonials;
