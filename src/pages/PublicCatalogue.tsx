import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product_config_id: string;
  product_code: string;
  category: string;
  subcategory: string;
  size_value: number;
  price?: number;
  quantity: number;
  [key: string]: any; // Index signature for JSON compatibility
}

const PublicCatalogue = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  
  const [catalogue, setCatalogue] = useState<any>(null);
  const [catalogueItems, setCatalogueItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCatalogue();
    }
  }, [slug]);

  const fetchCatalogue = async () => {
    try {
      setLoading(true);
      
      // Fetch catalogue
      const { data: catalogueData, error: catalogueError } = await supabase
        .from('catalogues')
        .select('*')
        .eq('public_url_slug', slug)
        .eq('is_active', true)
        .single();

      if (catalogueError) throw catalogueError;

      // If no catalogue found, set to null and exit early
      if (!catalogueData) {
        setCatalogue(null);
        return;
      }
      
      setCatalogue(catalogueData);

      // Fetch catalogue items
      const { data: itemsData, error: itemsError } = await supabase
        .from('catalogue_items')
        .select(`
          *,
          product_configs (
            id,
            product_code,
            category,
            subcategory,
            size_value,
            weight_range
          )
        `)
        .eq('catalogue_id', catalogueData.id)
        .order('display_order', { ascending: true });

      if (itemsError) throw itemsError;
      setCatalogueItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load catalogue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    const cartItem: CartItem = {
      product_config_id: item.product_config_id,
      product_code: item.product_configs.product_code,
      category: item.product_configs.category,
      subcategory: item.product_configs.subcategory,
      size_value: item.product_configs.size_value,
      price: item.custom_price,
      quantity: 1,
    };

    setCart(prev => {
      const existing = prev.find(i => i.product_config_id === cartItem.product_config_id);
      if (existing) {
        return prev.map(i => 
          i.product_config_id === cartItem.product_config_id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, cartItem];
    });
  };

  const updateCartQuantity = (productConfigId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product_config_id !== productConfigId));
    } else {
      setCart(prev => prev.map(item => 
        item.product_config_id === productConfigId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in your name and add items to cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('catalogue_orders')
        .insert({
          catalogue_id: catalogue.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone || null,
          customer_email: customerInfo.email || null,
          notes: customerInfo.notes || null,
          order_items: cart as any, // Cast to any for JSON compatibility
          total_amount: getTotalAmount(),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your order request has been submitted successfully!',
      });

      // Reset form and cart
      setCart([]);
      setCustomerInfo({ name: '', phone: '', email: '', notes: '' });
      setShowOrderForm(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit order request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading catalogue...</div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Catalogue Not Found</h1>
          <p className="text-gray-600">The catalogue you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (showOrderForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowOrderForm(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalogue
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order Summary</h3>
                {cart.map((item) => (
                  <div key={item.product_config_id} className="flex justify-between text-sm">
                    <div>
                      {item.product_code} x {item.quantity}
                    </div>
                    {item.price && (
                      <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                    )}
                  </div>
                ))}
                {getTotalAmount() > 0 && (
                  <div className="font-semibold pt-2 border-t">
                    Total: ₹{getTotalAmount().toFixed(2)}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Your Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements or notes"
                    rows={3}
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={submitting || !customerInfo.name}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Order Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            {catalogue.cover_image_url && (
              <img
                src={catalogue.cover_image_url}
                alt={catalogue.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-3xl font-bold mb-2">{catalogue.name}</h1>
            {catalogue.description && (
              <p className="text-gray-600">{catalogue.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cart Summary (sticky) */}
      {cart.length > 0 && (
        <div className="sticky top-0 z-10 bg-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{getTotalItems()} items in cart</span>
              {getTotalAmount() > 0 && (
                <span>• ₹{getTotalAmount().toFixed(2)}</span>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowOrderForm(true)}
            >
              Place Order
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {catalogueItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No products available</h3>
            <p className="text-gray-600">This catalogue is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catalogueItems.map((item) => {
              const cartItem = cart.find(c => c.product_config_id === item.product_config_id);
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {item.is_featured && (
                        <Badge className="mb-2">Featured</Badge>
                      )}
                      
                      <div>
                        <h3 className="font-semibold">{item.product_configs.product_code}</h3>
                        <p className="text-sm text-gray-600">
                          {item.product_configs.category} • {item.product_configs.subcategory}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.product_configs.size_value}m
                        </p>
                      </div>

                      {item.custom_description && (
                        <p className="text-sm text-gray-700">{item.custom_description}</p>
                      )}

                      {item.custom_price && (
                        <div className="text-lg font-semibold text-green-600">
                          ₹{item.custom_price}
                        </div>
                      )}

                      {cartItem ? (
                        <div className="flex items-center justify-center gap-3 p-2 bg-gray-50 rounded">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.product_config_id, cartItem.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{cartItem.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.product_config_id, cartItem.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCatalogue;
