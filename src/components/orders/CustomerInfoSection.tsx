
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
        <div>
          <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="h-8 text-xs"
            required
          />
        </div>
        <div>
          <Label htmlFor="customerPhone" className="text-xs">Phone Number *</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className="h-8 text-xs"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoSection;
