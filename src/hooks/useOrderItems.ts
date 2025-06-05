
import { useState } from 'react';

interface OrderItem {
  productCode: string;
  quantity: number;
  price: number;
}

export const useOrderItems = () => {
  const [items, setItems] = useState<OrderItem[]>([{
    productCode: '',
    quantity: 1,
    price: 0
  }]);

  const addItem = () => {
    setItems([...items, {
      productCode: '',
      quantity: 1,
      price: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    calculateTotal
  };
};
