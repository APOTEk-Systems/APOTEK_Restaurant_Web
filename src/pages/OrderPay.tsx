import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, CreditCard, DollarSign, Receipt, CheckCircle, Loader2, Split, AlertCircle, Printer } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { OrderService, Order } from "@/services/orderService";
import { PaymentService, PaymentMethod, Payment } from "@/services/paymentService";
import { printBill, printReceipt } from "@/utils/printBill";

const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode }[] = [
  { id: "CASH", name: "Cash", icon: <DollarSign className="h-4 w-4" /> },
  { id: "CRDB", name: "CRDB", icon: <CreditCard className="h-4 w-4" /> },
  { id: "MPESA", name: "Mpesa", icon: <Receipt className="h-4 w-4" /> },
];

interface OrderPaymentSummary {
  orderId: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  payments: Payment[];
}

type SplitType = 'method' | 'item';

export default function OrderPay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<OrderPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Payment form state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Split payment state
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitType, setSplitType] = useState<SplitType>("method");
  const [splitPayments, setSplitPayments] = useState<Array<{ amount: string; method: PaymentMethod; transactionId: string; itemIds?: number[] }>>([
    { amount: "", method: "CASH", transactionId: "", itemIds: [] },
  ]);

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const orderId = parseInt(id);

      // Fetch order with payments
      const orderData = await OrderService.getOrderById(orderId);
      setOrder(orderData);

      // Calculate payment summary from order payments
      const totalPaid = orderData.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remainingAmount = Math.max(0, (orderData.total || 0) - totalPaid);

      setPaymentSummary({
        orderId: orderData.id,
        totalAmount: orderData.total || 0,
        amountPaid: totalPaid,
        remainingAmount,
        isFullyPaid: totalPaid >= (orderData.total || 0),
        payments: orderData.payments || [],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load order data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get all selected item IDs across all payments
  const getAllSelectedItemIds = useMemo(() => {
    const allIds: number[] = [];
    splitPayments.forEach((payment) => {
      if (payment.itemIds) {
        payment.itemIds.forEach((id) => {
          if (!allIds.includes(id)) {
            allIds.push(id);
          }
        });
      }
    });
    return allIds;
  }, [splitPayments]);

  // Helper to check if an item is already selected in another payment
  const isItemSelectedInOtherPayment = (itemId: number, currentIndex: number): boolean => {
    return splitPayments.some((payment, index) => {
      if (index === currentIndex) return false;
      return payment.itemIds?.includes(itemId) || false;
    });
  };

  // Validate split payments
  const validateSplitPayments = (): string[] => {
    const errors: string[] = [];

    // Check for duplicate items
    const selectedItemsCount: Record<number, number> = {};
    splitPayments.forEach((payment, index) => {
      if (payment.itemIds) {
        payment.itemIds.forEach((itemId) => {
          selectedItemsCount[itemId] = (selectedItemsCount[itemId] || 0) + 1;
        });
      }
    });

    Object.entries(selectedItemsCount).forEach(([itemId, count]) => {
      if (count > 1) {
        const itemName = order?.orderItems.find(i => i.id === parseInt(itemId))?.menuItem?.name || `Item #${itemId}`;
        errors.push(`${itemName} is selected in multiple payments`);
      }
    });

    // Check if all items are exhausted in one payment
    const totalSelectedItems = getAllSelectedItemIds.length;
    const totalOrderItems = order?.orderItems.length || 0;

    if (splitType === "item" && totalSelectedItems === totalOrderItems && totalOrderItems > 0) {
      errors.push("Cannot select all items in split payment. Use single payment for full order payment.");
    }

    // Check if total payment exceeds order total
    const totalPayment = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    if (totalPayment > (paymentSummary?.totalAmount || 0)) {
      errors.push(`Total payments ($${totalPayment.toFixed(2)}) exceed order total ($${(paymentSummary?.totalAmount || 0).toFixed(2)})`);
    }

    // Check if total payment is zero
    if (totalPayment <= 0) {
      errors.push("Total payment amount must be greater than zero");
    }

    // Check for empty payments (no amount or no items)
    splitPayments.forEach((payment, index) => {
      const hasAmount = parseFloat(payment.amount) > 0;
      const hasItems = payment.itemIds && payment.itemIds.length > 0;
      if (!hasAmount && !hasItems) {
        errors.push(`Payment ${index + 1} has no amount or items selected`);
      }
    });

    return errors;
  };

  const handleSinglePayment = async () => {
    if (!order || !paymentSummary) return;

    const amount = parseFloat(amountReceived);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentService.createPayment({
        orderId: order.id,
        amount,
        paymentMethod: selectedMethod,
        transactionId: transactionId || undefined,
      });

      toast({
        title: "Payment Successful",
        description: `Payment of $${amount.toFixed(2)} recorded`,
      });

      await printReceipt(order);
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitPayment = async () => {
    if (!order || !paymentSummary) return;

    // Validate before submitting
    const errors = validateSplitPayments();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setValidationErrors([]);

    const payments = splitPayments
      .filter((p) => {
        const hasAmount = parseFloat(p.amount) > 0;
        const hasItems = p.itemIds && p.itemIds.length > 0;
        return hasAmount || hasItems;
      })
      .map((p) => ({
        amount: parseFloat(p.amount) || calculateItemTotal(p.itemIds || []),
        method: p.method,
        transactionId: p.transactionId || undefined,
      }));

    if (payments.length === 0) {
      toast({
        title: "No Payments",
        description: "Please add at least one payment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentService.processSplitPayment(order.id, payments.map(p => ({
        amount: p.amount,
        paymentMethod: p.method,
        transactionId: p.transactionId,
      })));

      toast({
        title: "Payments Successful",
        description: `${payments.length} payment(s) recorded`,
      });

      await printReceipt(order);
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payments",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSplitPayment = () => {
    if (splitPayments.length < 5) {
      setSplitPayments([...splitPayments, { amount: "", method: "CASH", transactionId: "", itemIds: [] }]);
    }
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
    setValidationErrors([]);
  };

  const updateSplitPayment = (index: number, field: string, value: string | PaymentMethod | number[]) => {
    const updated = [...splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setSplitPayments(updated);
    setValidationErrors([]);
  };

  const calculateSplitTotal = () => {
    return splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const calculateItemTotal = (itemIds: number[]) => {
    if (!order) return 0;
    return order.orderItems
      .filter((item) => itemIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const handleItemToggle = (index: number, itemId: number) => {
    const updated = [...splitPayments];
    const currentIds = updated[index].itemIds || [];
    
    if (currentIds.includes(itemId)) {
      updated[index].itemIds = currentIds.filter((id) => id !== itemId);
    } else {
      // Check if item is already selected in another payment
      if (isItemSelectedInOtherPayment(itemId, index)) {
        toast({
          title: "Item Already Selected",
          description: "This item is already selected in another payment",
          variant: "destructive",
        });
        return;
      }
      updated[index].itemIds = [...currentIds, itemId];
    }
    
    // Auto-calculate amount based on selected items
    const itemTotal = calculateItemTotal(updated[index].itemIds || []);
    updated[index].amount = itemTotal > 0 ? itemTotal.toFixed(2) : "";
    
    setSplitPayments(updated);
    setValidationErrors([]);
  };

  const handleSelectAllItems = (index: number) => {
    const updated = [...splitPayments];
    const allItemIds = order?.orderItems.map((item) => item.id) || [];
    
    // Check if any items are already selected in other payments
    const alreadySelected = allItemIds.filter(id => isItemSelectedInOtherPayment(id, index));
    
    // Only select items that aren't already selected
    const availableItemIds = allItemIds.filter(id => !isItemSelectedInOtherPayment(id, index));
    
    updated[index].itemIds = availableItemIds;
    
    // Auto-calculate amount
    const itemTotal = calculateItemTotal(availableItemIds);
    updated[index].amount = itemTotal > 0 ? itemTotal.toFixed(2) : "";
    
    if (alreadySelected.length > 0) {
      toast({
        title: "Some Items Excluded",
        description: `${alreadySelected.length} item(s) were already selected in other payments and were not included`,
        variant: "default",
      });
    }
    
    setSplitPayments(updated);
    setValidationErrors([]);
  };

  const handleDeselectAllItems = (index: number) => {
    const updated = [...splitPayments];
    updated[index].itemIds = [];
    updated[index].amount = "";
    setSplitPayments(updated);
    setValidationErrors([]);
  };

  const getItemSelectedBy = (itemId: number): number | null => {
    const paymentIndex = splitPayments.findIndex((payment, index) => 
      index !== -1 && payment.itemIds?.includes(itemId)
    );
    return paymentIndex >= 0 ? paymentIndex : null;
  };

  if (isLoading) {
    return (
      <MainLayout title="Processing Payment" subtitle="Loading order details...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout title="Order Not Found">
        <Link to="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </MainLayout>
    );
  }

  const changeAmount = parseFloat(amountReceived) - (paymentSummary?.remainingAmount || 0);

  // Validation summary
  const validationIssues = validateSplitPayments();

  return (
    <MainLayout title="Record Payment" subtitle={`Order #${order.orderNumber}`}>
      <div className="space-y-6">
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
                    <p className="text-sm text-muted-foreground">Order #</p>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Table</p>
                    <p className="font-medium">{order.tableNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.customerName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waiter</p>
                    <p className="font-medium">{order.waiter || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {order.orderItems.map((item) => {
                      const selectedBy = getItemSelectedBy(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex justify-between items-center p-2 rounded-lg ${
                            selectedBy !== null 
                              ? 'bg-muted/50 border border-primary/20' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.menuItem.name}</span>
                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            {selectedBy !== null && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                P{selectedBy + 1}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-foreground">{paymentSummary?.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="text-foreground">{paymentSummary?.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Remaining</span>
                    <span className="text-primary">{paymentSummary?.remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {paymentSummary?.payments && paymentSummary.payments.length > 0 && (
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {paymentSummary.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-2 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            ${payment.amount.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Payment Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSplitMode(!isSplitMode);
                      setValidationErrors([]);
                    }}
                    className="text-sm"
                  >
                    {isSplitMode ? (
                      <>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Single Payment
                      </>
                    ) : (
                      <>
                        <Split className="h-4 w-4 mr-1" />
                        Split Payment
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isSplitMode ? (
                  // Single Payment Mode
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <Select
                        value={selectedMethod}
                        onValueChange={(value: PaymentMethod) => setSelectedMethod(value)}
                      >
                        <SelectTrigger id="payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
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
                        min={paymentSummary?.remainingAmount}
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        placeholder={`Minimum $${paymentSummary?.remainingAmount.toFixed(2)}`}
                        required
                      />
                    </div>

                    {selectedMethod !== "CASH" && (
                      <div className="space-y-2">
                        <Label htmlFor="transaction-id">Transaction ID</Label>
                        <Input
                          id="transaction-id"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Reference number, receipt ID, etc."
                        />
                      </div>
                    )}

                    {changeAmount > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                        <span className="text-sm text-green-600">Change to Return</span>
                        <span className="font-medium text-green-600">
                          {changeAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full"
                        disabled={
                          isSubmitting ||
                          !amountReceived ||
                          parseFloat(amountReceived) < (paymentSummary?.remainingAmount || 0)
                        }
                        onClick={handleSinglePayment}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment ({paymentSummary?.remainingAmount.toFixed(2)})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Split Payment Mode
                  <div className="space-y-4">
                    {/* Split Type Selection */}
                    <div className="flex gap-4 mb-4">
                      <Button
                        variant={splitType === "method" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSplitType("method");
                          setValidationErrors([]);
                        }}
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        By Method
                      </Button>
                      <Button
                        variant={splitType === "item" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSplitType("item");
                          setValidationErrors([]);
                        }}
                        className="flex-1"
                      >
                        <Split className="h-4 w-4 mr-1" />
                        By Item
                      </Button>
                    </div>

                    {splitType === "item" && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Select items to include in each split payment. Items cannot be selected in multiple payments.
                      </div>
                    )}

                    {/* Validation Errors */}
                    {validationIssues.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-500">Validation Issues</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-500/80 space-y-1">
                          {validationIssues.slice(0, 3).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {validationIssues.length > 3 && (
                            <li>+{validationIssues.length - 3} more issues</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {splitPayments.map((payment, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Payment {index + 1}</span>
                          {splitPayments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSplitPayment(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        {splitType === "item" && order && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Select Items</Label>
                              <div className="flex gap-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => handleSelectAllItems(index)}
                                >
                                  Select All
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => handleDeselectAllItems(index)}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                              {order.orderItems.map((item) => {
                                const isSelectedInThis = (payment.itemIds || []).includes(item.id);
                                const isSelectedInOther = isItemSelectedInOtherPayment(item.id, index);
                                const isDisabled = !isSelectedInThis && isSelectedInOther;
                                const selectedBy = isSelectedInOther ? getItemSelectedBy(item.id) : null;
                                
                                return (
                                  <div key={item.id} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-50' : ''}`}>
                                    <Checkbox
                                      id={`item-${index}-${item.id}`}
                                      checked={isSelectedInThis}
                                      disabled={isDisabled}
                                      onCheckedChange={() => handleItemToggle(index, item.id)}
                                    />
                                    <label
                                      htmlFor={`item-${index}-${item.id}`}
                                      className={`text-sm flex-1 cursor-pointer ${
                                        isDisabled ? 'line-through text-muted-foreground' : ''
                                      }`}
                                    >
                                      {item.menuItem.name} - ${item.price.toFixed(2)}
                                      {isDisabled && selectedBy !== null && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          (P{selectedBy + 1})
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                            {getAllSelectedItemIds.length === order.orderItems.length && (
                              <p className="text-xs text-amber-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                All items selected. Use single payment for full order.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Method</Label>
                            <Select
                              value={payment.method}
                              onValueChange={(value: PaymentMethod) =>
                                updateSplitPayment(index, "method", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((method) => (
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
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={payment.amount}
                              onChange={(e) =>
                                updateSplitPayment(index, "amount", e.target.value)
                              }
                              placeholder="0.00"
                              disabled={splitType === "item" && (payment.itemIds?.length || 0) > 0}
                            />
                          </div>
                        </div>

                        {payment.method !== "CASH" && (
                          <div className="space-y-2">
                            <Label>Transaction ID</Label>
                            <Input
                              value={payment.transactionId}
                              onChange={(e) =>
                                updateSplitPayment(index, "transactionId", e.target.value)
                              }
                              placeholder="Reference number"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {splitPayments.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addSplitPayment}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Payment Method
                      </Button>
                    )}

                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total to Pay</span>
                        <span className="text-lg font-semibold">
                          {calculateSplitTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Order Total</span>
                        <span>{paymentSummary?.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Remaining After</span>
                        <span
                          className={
                            calculateSplitTotal() >= (paymentSummary?.totalAmount || 0)
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {(paymentSummary?.totalAmount || 0) - calculateSplitTotal()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full"
                        disabled={
                          isSubmitting ||
                          calculateSplitTotal() <= 0 ||
                          calculateSplitTotal() > (paymentSummary?.totalAmount || 0) ||
                          validationIssues.length > 0
                        }
                        onClick={handleSplitPayment}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record {splitPayments.length} Payment(s)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}