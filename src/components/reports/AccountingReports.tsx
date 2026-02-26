import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportsService } from "@/services/reportsService";
import { exportAccountingReport } from "@/utils/pdfAccountingReports";
import { DateRange } from "@/utils/pdfUtils";

interface AccountingReportsProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const reportTypes = [
  { value: "expense-summary", label: "Expense Summary" },
  { value: "expense-detailed", label: "Expense Detailed" },
];

export default function AccountingReports({ dateRange, onDateRangeChange }: AccountingReportsProps) {
  const [reportType, setReportType] = useState<string>("expense-summary");
  const [isLoading, setIsLoading] = useState(false);

  const getReportTitle = () => {
    const report = reportTypes.find(r => r.value === reportType);
    return report?.label || "Expense Report";
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      let data: any[] = [];
      
      switch (reportType) {
        case "expense-summary":
          data = await ReportsService.getExpenseSummary(params);
          break;
        case "expense-detailed":
          data = await ReportsService.getExpenseDetailed(params);
          break;
        default:
          console.error("Unknown report type:", reportType);
      }

      if (data.length > 0) {
        const dateRangeObj: DateRange = {
          from: dateRange.from,
          to: dateRange.to
        };
        await exportAccountingReport(reportType, data, dateRangeObj, getReportTitle());
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle>Accounting Reports</CardTitle>
        <CardDescription>Generate expense and revenue reports</CardDescription>
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
                {reportTypes.map((report) => (
                  <SelectItem key={report.value} value={report.value}>
                    {report.label}
                  </SelectItem>
                ))}
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