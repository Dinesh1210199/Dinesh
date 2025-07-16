import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, CreditCard, Pause } from "lucide-react";
import type { CartItem, Customer } from "@shared/schema";

interface CartProps {
  items: CartItem[];
  selectedCustomer: Customer | null;
  selectedPriceType: string;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCustomerChange: (customerId: number) => void;
  onPriceTypeChange: (priceType: string) => void;
  onProcessPayment: () => void;
  customers: Customer[];
}

export function Cart({
  items,
  selectedCustomer,
  selectedPriceType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCustomerChange,
  onPriceTypeChange,
  onProcessPayment,
  customers
}: CartProps) {
  const [holdOrder, setHoldOrder] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = items.reduce((sum, item) => sum + (item.total * item.gstRate) / 100, 0);
  const total = subtotal + gstAmount;

  const handleHoldOrder = () => {
    setHoldOrder(true);
    // In a real app, this would save the order to hold
    alert("Order held successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Customer:</span>
            </div>
            <Select
              value={selectedCustomer?.id?.toString() || "1"}
              onValueChange={(value) => onCustomerChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pricing:</span>
            </div>
            <Select value={selectedPriceType} onValueChange={onPriceTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="counter">Counter Sale</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="custom">Custom Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Items in Cart</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">₹{item.unitPrice.toFixed(2)}/{item.unit}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">₹{item.total.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST:</span>
                <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              disabled={items.length === 0}
              onClick={onProcessPayment}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={items.length === 0}
              onClick={handleHoldOrder}
            >
              <Pause className="h-4 w-4 mr-2" />
              Hold Order
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              disabled={items.length === 0}
              onClick={onClearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
