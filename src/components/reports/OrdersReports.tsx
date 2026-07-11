import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ReportsService, OrderSummary, OrderDetailed, PaymentReport, RefundReport } from "@/services/reportsService";
import { exportOrderReport } from "@/utils/pdfOrderReports";
import { DateRange } from "@/utils/pdfUtils";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { staffService, type Staff } from "@/services/staffService";
import { useQuery } from "@tanstack/react-query";

interface OrdersReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function OrdersReports({ dateRange, onDateRangeChange }: OrdersReportsProps) {
  const [reportType, setReportType] = useState<string>("summary");
  const [waiter, setWaiter] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: waiters = [] } = useQuery({
    queryKey: ['waiters'],
    queryFn: () => staffService.getWaiters(),
  });

  const getReportTitle = () => {
    switch (reportType) {
      case "summary": return "Order Summary Report";
      case "detailed": return "Order Detailed Report";
      case "payments": return "Payments Report";
      case "refunds": return "Refund Report";
      default: return "Order Report";
    }
  };

  const buildFilters = (): string => {
    const filters: string[] = [];
    if (waiter && waiter !== "all") filters.push(`Waiter: ${waiter}`);
    if (paymentMethod && paymentMethod !== "all") filters.push(`Payment Method: ${paymentMethod}`);
    return filters.join(", ");
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        startDate: dateRange.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange.to ? dateRange.to.toISOString() : undefined,
      };

      if (waiter && waiter !== "all") params.waiter = waiter;
      if (reportType === "payments" && paymentMethod && paymentMethod !== "all") params.paymentMethod = paymentMethod;

      let data: any[] = [];
      
      switch (reportType) {
        case "summary":
          data = await ReportsService.getOrderSummary(params);
          break;
        case "detailed":
          data = await ReportsService.getOrderDetailed(params);
          break;
        case "payments":
          data = await ReportsService.getPayments(params);
          break;
        case "refunds":
          data = await ReportsService.getRefunds(params);
          break;
      }

      if (data.length > 0) {
        const dateRangeObj: DateRange = {
          from: dateRange.from,
          to: dateRange.to
        };
        const filters = buildFilters();
        await exportOrderReport(reportType, data, dateRangeObj, getReportTitle(), filters);
      } else {
        toast({
          title: "No Data Available",
          description: `No ${getReportTitle().toLowerCase()} data available to generate the report.`,
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle>Order Reports</CardTitle>
        <CardDescription>Generate order summary, detailed, payments, and refund reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
          {/* Report Type Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Order Summary</SelectItem>
                <SelectItem value="detailed">Order Detailed</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="refunds">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Waiter Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Waiter</label>
            <Select value={waiter} onValueChange={setWaiter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Waiters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Waiters</SelectItem>
                {waiters.map((w) => (
                  <SelectItem key={w.id} value={`${w.firstName} ${w.lastName}`}>
                    {w.firstName} {w.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          {reportType === "payments" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="CRDB">CRDB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range Picker */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              dateRange={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
              onDateRangeChange={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
            />
          </div>

          {/* Generate Button */}
          <Button onClick={handleGeneratePDF} disabled={isLoading} className="sm:col-span-2">
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate PDF"}
          </Button>
        </div>

        
      </CardContent>
    </Card>
  );
}