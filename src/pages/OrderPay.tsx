import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, DollarSign, Receipt, Smartphone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const paymentMethods = [
  { id: "cash", name: "Cash", icon: <DollarSign className="h-4 w-4" /> },
  { id: "credit_card", name: "Credit Card", icon: <CreditCard className="h-4 w-4" /> },
  { id: "mobile_money", name: "Mobile Money", icon: <Smartphone className="h-4 w-4" /> },
  { id: "bank_transfer", name: "Bank Transfer", icon: <Receipt className="h-4 w-4" /> },
];

// Mock order data - in a real app this would come from an API
const mockOrders = {
  "ORD-001": {
    id: "#ORD-001",
    customer: "John Smith",
    table: "Table 5",
    items: [
      { name: "Grilled Salmon", price: 32.00, quantity: 1 },
      { name: "Caesar Salad", price: 14.00, quantity: 1 },
      { name: "Red Wine", price: 12.00, quantity: 2 }
    ],
    subtotal: 86.50,
    tax: 8.65,
    total: 95.15,
    waiter: "Sarah M.",
    time: "10:45 AM"
  },
  "ORD-002": {
    id: "#ORD-002",
    customer: "Emily Chen",
    table: "Table 12",
    items: [
      { name: "Ribeye Steak", price: 45.00, quantity: 1 },
      { name: "Mashed Potatoes", price: 8.00, quantity: 2 }
    ],
    subtotal: 72.00,
    tax: 7.20,
    total: 79.20,
    waiter: "Mike R.",
    time: "10:32 AM"
  }
};

export default function OrderPay() {
  const { id } = useParams<{ id: string }>();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const order = mockOrders[`ORD-${id}`] || mockOrders["ORD-001"];
  const change = parseFloat(amountReceived) - order.total;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // In a real app, this would call an API to record the payment
    console.log("Recording payment:", {
      orderId: order.id,
      paymentMethod,
      amountReceived: parseFloat(amountReceived),
      paymentNotes,
      change: change >= 0 ? change : 0
    });

    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to orders page after successful payment
      window.location.href = "/orders";
    }, 2000);
  };

  return (
    <MainLayout title="Record Payment" subtitle={`Payment for Order ${order.id}`}>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-medium">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Table</p>
                    <p className="font-medium">{order.table}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waiter</p>
                    <p className="font-medium">{order.waiter}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total Due</span>
                    <span className="text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              {method.icon}
                              <span>{method.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount-received">Amount Received</Label>
                    <Input
                      id="amount-received"
                      type="number"
                      step="0.01"
                      min={order.total}
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder={`Minimum $${order.total.toFixed(2)}`}
                      required
                    />
                  </div>

                  {change > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                      <span className="text-sm text-success">Change to Return</span>
                      <span className="font-medium text-success">${change.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="payment-notes">Payment Notes</Label>
                    <Input
                      id="payment-notes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Receipt number, reference, etc."
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                      disabled={isProcessing || !amountReceived || parseFloat(amountReceived) < order.total}
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin mr-2">🔄</span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Record Payment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}