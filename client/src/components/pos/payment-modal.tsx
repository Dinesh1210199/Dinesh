import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Smartphone, Coins } from "lucide-react";
import type { CartItem } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (payments: any[]) => void;
  total: number;
  items: CartItem[];
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete, total, items }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [splitPayments, setSplitPayments] = useState<Array<{ method: string; amount: number }>>([]);
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [isSplitMode, setIsSplitMode] = useState(false);

  const remainingAmount = total - splitPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleSinglePayment = (method: string) => {
    const payments = [{ method, amount: total, transactionId: generateTransactionId() }];
    onPaymentComplete(payments);
    resetModal();
  };

  const handleSplitPayment = () => {
    setIsSplitMode(true);
  };

  const addSplitPayment = () => {
    if (!paymentMethod || !currentAmount) return;
    
    const amount = parseFloat(currentAmount);
    if (amount <= 0 || amount > remainingAmount) return;

    setSplitPayments(prev => [...prev, { method: paymentMethod, amount }]);
    setCurrentAmount("");
    setPaymentMethod("");
  };

  const completeSplitPayment = () => {
    if (Math.abs(remainingAmount) < 0.01) {
      const payments = splitPayments.map(p => ({
        ...p,
        transactionId: generateTransactionId()
      }));
      onPaymentComplete(payments);
      resetModal();
    }
  };

  const resetModal = () => {
    setPaymentMethod("");
    setSplitPayments([]);
    setCurrentAmount("");
    setIsSplitMode(false);
    onClose();
  };

  const generateTransactionId = () => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote, color: "bg-green-600 hover:bg-green-700" },
    { id: "card", label: "Card", icon: CreditCard, color: "bg-blue-600 hover:bg-blue-700" },
    { id: "wallet", label: "Wallet", icon: Smartphone, color: "bg-purple-600 hover:bg-purple-700" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Amount */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              {isSplitMode && (
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="text-lg font-semibold text-orange-600">₹{remainingAmount.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {!isSplitMode ? (
            /* Single Payment Options */
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    className={`w-full ${method.color} text-white`}
                    onClick={() => handleSinglePayment(method.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    Pay with {method.label}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSplitPayment}
              >
                <Coins className="h-4 w-4 mr-2" />
                Split Payment
              </Button>
            </div>
          ) : (
            /* Split Payment Interface */
            <div className="space-y-4">
              {splitPayments.length > 0 && (
                <div className="space-y-2">
                  <Label>Split Payments:</Label>
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="capitalize">{payment.method}</span>
                      <Badge variant="outline">₹{payment.amount.toFixed(2)}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {remainingAmount > 0.01 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="Enter amount"
                      max={remainingAmount}
                    />
                  </div>

                  <Button
                    onClick={addSplitPayment}
                    disabled={!paymentMethod || !currentAmount || parseFloat(currentAmount) <= 0}
                    className="w-full"
                  >
                    Add Payment
                  </Button>
                </div>
              )}

              {Math.abs(remainingAmount) < 0.01 && (
                <Button onClick={completeSplitPayment} className="w-full">
                  Complete Payment
                </Button>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={resetModal} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
