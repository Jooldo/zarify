import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=40&h=40&fit=crop&crop=center" 
              alt="Zarify Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-2xl font-bold">Zarify</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href = "/pricing"}>
              Pricing
            </Button>
            <Button onClick={() => window.location.href = "/app"}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 md:py-32 lg:py-48 bg-hero-pattern bg-cover bg-center text-center">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            The All-In-One Platform for Jewelry & Custom Manufacturing
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Streamline your orders, inventory, and procurement with our powerful, easy-to-use system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage your manufacturing process, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Order Management</h3>
              <p className="text-muted-foreground">
                Track and manage orders from start to finish, ensuring timely delivery and customer satisfaction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-muted-foreground">
                Real-time inventory tracking, automated alerts, and seamless integration with procurement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Procurement Management</h3>
              <p className="text-muted-foreground">
                Simplify your procurement process, manage suppliers, and optimize costs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Production Planning</h3>
              <p className="text-muted-foreground">
                Plan and schedule production runs efficiently, ensuring optimal resource utilization.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Quality Control</h3>
              <p className="text-muted-foreground">
                Implement quality control checks at every stage of the manufacturing process.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Reporting & Analytics</h3>
              <p className="text-muted-foreground">
                Gain insights into your manufacturing process with detailed reports and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <p className="text-lg italic mb-4">
                "Zarify has transformed our manufacturing process. We've seen a significant improvement in efficiency and a reduction in costs."
              </p>
              <p className="font-semibold">- John Doe, CEO</p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <p className="text-lg italic mb-4">
                "The all-in-one platform has made it easy to manage our orders, inventory, and procurement. Highly recommended!"
              </p>
              <p className="font-semibold">- Jane Smith, Production Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Streamline Your Manufacturing Process?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your free trial today and experience the power of Zarify.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=40&h=40&fit=crop&crop=center" 
              alt="Zarify Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-2xl font-bold">Zarify</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Zarify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
