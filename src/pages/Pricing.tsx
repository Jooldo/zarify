
import { Check, X, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      idealFor: "New/small businesses",
      price: "₹0",
      period: "Forever free",
      users: "1 User",
      ordersPerMonth: "50",
      features: {
        inventoryMgt: true,
        procurementMgt: false,
        multiStepManufacturing: false,
        customReports: false,
      },
      support: "Email",
      addOns: "–",
      ctaText: "Start Free",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      idealFor: "Scaling teams",
      price: "₹2,499",
      period: "/month",
      users: "Up to 5 Users",
      ordersPerMonth: "500",
      features: {
        inventoryMgt: true,
        procurementMgt: true,
        multiStepManufacturing: true,
        customReports: true,
      },
      support: "Priority Email & Chat",
      addOns: "Additional Users: ₹499/mo",
      ctaText: "Start 14-Day Trial",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      idealFor: "Large-scale manufacturers",
      price: "Custom",
      period: "Pricing",
      users: "Unlimited Users",
      ordersPerMonth: "Unlimited",
      features: {
        inventoryMgt: true,
        procurementMgt: true,
        multiStepManufacturing: true,
        customReports: true,
      },
      support: "Dedicated Account Manager",
      addOns: "Custom Integrations",
      ctaText: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false,
    },
  ];

  const whyChooseReasons = [
    "Built specifically for Jewelry & Custom Manufacturing",
    "End-to-End Order, Inventory & Procurement Management",
    "Scales with your business – from 1 order to 10,000+",
  ];

  const faqs = [
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Our Pro plan comes with a 14-day free trial with full access to all features. Our Starter plan is free forever with basic features."
    },
    {
      question: "What if I need help setting up?",
      answer: "We provide comprehensive onboarding support for all plans. Pro users get priority email and chat support, while Enterprise customers have a dedicated account manager to help with setup and ongoing needs."
    },
    {
      question: "Are there any setup fees?",
      answer: "No setup fees for any plan. You only pay the monthly subscription fee, and you can cancel anytime."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and UPI payments. Enterprise customers can also opt for invoice-based billing."
    }
  ];

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
            <Button variant="ghost" onClick={() => window.location.href = "/"}>
              Back to App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing –{" "}
            <span className="text-primary">Built for Growing Manufacturers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start free, scale fast. Only pay for what you use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose the Right Plan for Your Business
            </h2>
            <p className="text-xl text-muted-foreground">
              From startups to enterprises, we have a plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.idealFor}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Users</span>
                      <span className="text-sm font-medium">{plan.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Orders/Month</span>
                      <span className="text-sm font-medium">{plan.ordersPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Inventory Management</span>
                      {plan.features.inventoryMgt ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Procurement Management</span>
                      {plan.features.procurementMgt ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Multi-Step Manufacturing</span>
                      {plan.features.multiStepManufacturing ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Custom Reports</span>
                      {plan.features.customReports ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Support</span>
                      <span className="text-sm font-medium text-right max-w-32">{plan.support}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Add-Ons</span>
                      <span className="text-sm font-medium text-right max-w-32">{plan.addOns}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.ctaText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Zarify */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Zarify?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {whyChooseReasons.map((reason, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <Star className="h-8 w-8 text-primary" />}
                  {index === 1 && <Shield className="h-8 w-8 text-primary" />}
                  {index === 2 && <Zap className="h-8 w-8 text-primary" />}
                </div>
                <p className="text-lg font-medium">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Manufacturing Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of manufacturers who trust Zarify to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Book Demo
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

export default Pricing;
