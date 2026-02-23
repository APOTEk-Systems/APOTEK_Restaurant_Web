import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchasesReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function PurchasesReports({ dateRange, onDateRangeChange }: PurchasesReportsProps) {
  const [reportType, setReportType] = useState<string>("purchase-summary");
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement PDF generation for purchases reports
      console.log("Generating purchases report:", reportType);
    } catch (error) {
      console.error("Error generating report:", error);
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
                <SelectItem value="purchase-summary">Purchase Summary</SelectItem>
                <SelectItem value="goods-receiving">Goods Receiving</SelectItem>
                <SelectItem value="suppliers">Supplier Report</SelectItem>
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