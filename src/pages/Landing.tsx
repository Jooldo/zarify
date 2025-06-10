
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ArrowUp, LayoutDashboard, LayoutList, Link, Search } from 'lucide-react';

const Landing = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-xl">Zarify</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('benefits')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </button>
            <Button asChild>
              <a href="/app">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            For Jewelry Manufacturers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Streamline Your Jewelry Manufacturing with{' '}
            <span className="text-primary">Zarify</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete order management, inventory tracking, and production workflow designed specifically for jewelry manufacturers. From raw materials to finished pieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="text-lg px-8">
              <a href="/app">Start Free Trial</a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => scrollToSection('features')}>
              See Features
            </Button>
          </div>
          <div className="animate-bounce">
            <ChevronDown className="mx-auto h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Jewelry Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zarify provides a comprehensive suite of tools designed specifically for jewelry manufacturers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  Track orders from inquiry to delivery with real-time status updates and customer communication
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <LayoutList className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Inventory Control</CardTitle>
                <CardDescription>
                  Manage raw materials and finished goods with automated low-stock alerts and procurement requests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Production Tracking</CardTitle>
                <CardDescription>
                  Monitor manufacturing processes with Kanban boards and step-by-step workflow management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Link className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Supplier Management</CardTitle>
                <CardDescription>
                  Maintain supplier relationships with contact management and procurement history tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <ArrowUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Get insights into your business performance with comprehensive dashboards and reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-user Access</CardTitle>
                <CardDescription>
                  Collaborate with your team using role-based access controls and activity logging
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Jewelry Manufacturers Choose Zarify
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Reduce Order Processing Time by 60%</h3>
                    <p className="text-muted-foreground">Streamlined workflows eliminate manual processes and reduce errors in order management</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Never Run Out of Materials</h3>
                    <p className="text-muted-foreground">Automated inventory tracking with smart reorder points keeps your production running smoothly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Improve Customer Satisfaction</h3>
                    <p className="text-muted-foreground">Real-time order tracking and communication tools keep customers informed and happy</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Scale Your Business</h3>
                    <p className="text-muted-foreground">Organized systems and processes that grow with your manufacturing capacity</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-2xl p-8">
              <div className="bg-background rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold mb-4">Dashboard Preview</h3>
                <div className="space-y-3">
                  <div className="h-4 bg-primary/20 rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="h-12 bg-primary/10 rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Jewelry Manufacturers
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about Zarify
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "Zarify transformed our jewelry manufacturing process. We've reduced order processing time significantly and our inventory management is now seamless."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">SK</span>
                  </div>
                  <div>
                    <p className="font-semibold">Suresh Kumar</p>
                    <p className="text-sm text-muted-foreground">Owner, Golden Crafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "The real-time tracking and analytics have given us insights we never had before. Our efficiency has improved dramatically."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">RP</span>
                  </div>
                  <div>
                    <p className="font-semibold">Rajesh Patel</p>
                    <p className="text-sm text-muted-foreground">CEO, Diamond Designs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "Customer satisfaction has improved because of better order tracking and communication. Zarify is essential for our business."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">MS</span>
                  </div>
                  <div>
                    <p className="font-semibold">Meera Shah</p>
                    <p className="text-sm text-muted-foreground">Director, Silver Moon Jewelry</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Jewelry Manufacturing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of jewelry manufacturers who trust Zarify to streamline their operations and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <a href="/app">Start Free Trial</a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">Z</span>
                </div>
                <span className="font-bold text-xl">Zarify</span>
              </div>
              <p className="text-muted-foreground">
                Streamlining jewelry manufacturing with intelligent order and inventory management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Training</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Zarify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
