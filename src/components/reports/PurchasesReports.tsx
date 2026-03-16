import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportsService } from "@/services/reportsService";
import { exportPurchaseReport } from "@/utils/pdfPurchaseReports";
import { DateRange } from "@/utils/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface PurchasesReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function PurchasesReports({ dateRange, onDateRangeChange }: PurchasesReportsProps) {
  const [reportType, setReportType] = useState<string>("purchase-summary");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getReportTitle = () => {
    switch (reportType) {
      case "goods-received": return "Goods Received Report";
      case "purchase-detailed": return "Purchase Order Detailed Report";
      case "purchase-summary": return "Purchase Order Summary Report";
      case "suppliers": return "Suppliers List Report";
      default: return "Purchase Report";
    }
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: dateRange.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange.to ? dateRange.to.toISOString() : undefined,
      };

      let data: any[] = [];
      
      switch (reportType) {
        case "goods-received":
          data = await ReportsService.getGoodsReceived(params);
          break;
        case "purchase-detailed":
          data = await ReportsService.getPurchaseOrderDetailed(params);
          break;
        case "purchase-summary":
          data = await ReportsService.getPurchaseOrderSummary(params);
          break;
        case "suppliers":
          data = await ReportsService.getSuppliersList();
          break;
      }

      if (data.length > 0) {
        const dateRangeObj: DateRange = {
          from: dateRange.from,
          to: dateRange.to
        };
        await exportPurchaseReport(reportType, data, dateRangeObj, getReportTitle());
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
        <CardTitle>Purchases Reports</CardTitle>
        <CardDescription>Generate purchase order and goods receiving reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48 lg:w-96">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase-summary">Purchase Order Summary</SelectItem>
                <SelectItem value="purchase-detailed">Purchase Order Detailed</SelectItem>
                <SelectItem value="goods-received">Goods Received</SelectItem>
                <SelectItem value="suppliers">List of Suppliers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              dateRange={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
              onDateRangeChange={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
            />
          </div>

          <Button onClick={handleGeneratePDF} disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate PDF"}
          </Button>
        </div>

   
      </CardContent>
    </Card>
  );
}