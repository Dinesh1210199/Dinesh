import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { ProductCatalog } from "@/components/pos/product-catalog";
import { Cart } from "@/components/pos/cart";
import { PaymentModal } from "@/components/pos/payment-modal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { localStorage } from "@/lib/local-storage";
import type { Product, Customer, CartItem } from "@shared/schema";

export default function POS() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPriceType, setSelectedPriceType] = useState("counter");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Order completed successfully!",
      });
      setCartItems([]);
      localStorage.clearCart();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to complete order",
        variant: "destructive",
      });
    },
  });

  const getPrice = (product: Product, priceType: string) => {
    switch (priceType) {
      case "wholesale":
        return parseFloat(product.wholesalePrice);
      case "custom":
        return parseFloat(product.customPrice || product.counterPrice);
      default:
        return parseFloat(product.counterPrice);
    }
  };

  const handleAddToCart = (product: Product, priceType: string) => {
    const unitPrice = getPrice(product, priceType);
    const existingItem = cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      setCartItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * unitPrice 
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unit: product.unit,
        unitPrice,
        priceType,
        total: unitPrice,
        gstRate: parseFloat(product.gstRate)
      };
      setCartItems(items => [...items, newItem]);
    }

    // Save to localStorage for offline support
    localStorage.saveCart([...cartItems]);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.productId === productId
          ? { 
              ...item, 
              quantity,
              total: quantity * item.unitPrice 
            }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(items => items.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.clearCart();
  };

  const handleCustomerChange = (customerId: number) => {
    const customer = customers?.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handlePriceTypeChange = (priceType: string) => {
    setSelectedPriceType(priceType);
    // Update cart items with new pricing
    setCartItems(items =>
      items.map(item => {
        // In a real app, you'd fetch the product to get the correct price
        return item;
      })
    );
  };

  const handleProcessPayment = () => {
    if (cartItems.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (payments: any[]) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = cartItems.reduce((sum, item) => sum + (item.total * item.gstRate) / 100, 0);
    const total = subtotal + gstAmount;

    const orderData = {
      order: {
        orderNumber: `ORD${Date.now()}`,
        customerId: selectedCustomer?.id || 1,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        subtotal: subtotal.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: payments.length > 1 ? "split" : payments[0].method,
        paymentStatus: "completed",
        status: "completed"
      },
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice.toFixed(2),
        priceType: item.priceType,
        total: item.total.toFixed(2)
      })),
      payments: payments.map(payment => ({
        method: payment.method,
        amount: payment.amount.toFixed(2),
        transactionId: payment.transactionId,
        status: "completed"
      }))
    };

    createOrderMutation.mutate(orderData);
    setIsPaymentModalOpen(false);
  };

  const total = cartItems.reduce((sum, item) => {
    const gst = (item.total * item.gstRate) / 100;
    return sum + item.total + gst;
  }, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="POS Terminal" />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <ProductCatalog 
            onAddToCart={handleAddToCart}
            selectedPriceType={selectedPriceType}
          />
          <Cart
            items={cartItems}
            selectedCustomer={selectedCustomer}
            selectedPriceType={selectedPriceType}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCustomerChange={handleCustomerChange}
            onPriceTypeChange={handlePriceTypeChange}
            onProcessPayment={handleProcessPayment}
            customers={customers || []}
          />
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        total={total}
        items={cartItems}
      />
    </div>
  );
}
