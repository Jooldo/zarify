
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';

interface CustomerInfoSectionProps {
  customerName: string;
  customerPhone: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
}

const CustomerInfoSection = ({
  customerName,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange
}: CustomerInfoSectionProps) => {
  const { searchCustomers } = useCustomerAutocomplete();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleNameChange = (value: string) => {
    onCustomerNameChange(value);
    
    if (value.trim()) {
      const customerSuggestions = searchCustomers(value);
      setSuggestions(customerSuggestions);
      setShowSuggestions(customerSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    
    onCustomerPhoneChange(limitedDigits);
  };

  const selectCustomer = (customer: any) => {
    onCustomerNameChange(customer.name);
    onCustomerPhoneChange(customer.phone || '');
    setShowSuggestions(false);
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    return phone.length === 10 ? `+91 ${phone}` : phone;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
        <div className="relative">
          <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="h-8 text-xs"
            required
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {suggestions.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  onClick={() => selectCustomer(customer)}
                  className="w-full justify-start h-auto p-2 text-xs hover:bg-gray-50"
                >
                  <div className="text-left">
                    <div className="font-medium">{customer.name}</div>
                    {customer.phone && (
                      <div className="text-gray-500">+91 {customer.phone}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="customerPhone" className="text-xs">Phone Number *</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              +91
            </span>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="10-digit mobile number"
              className="h-8 text-xs pl-8"
              maxLength={10}
              required
            />
          </div>
          {customerPhone && customerPhone.length === 10 && (
            <div className="text-xs text-gray-500 mt-1">
              Display: {formatPhoneDisplay(customerPhone)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoSection;
