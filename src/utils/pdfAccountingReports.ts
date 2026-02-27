import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatDate,
  formatCurrency,
  getCompanySettings,
  addCompanyHeader,
  addReportInfo,
  defaultTableStyles,
  openPDFInNewTab,
  DateRange,
} from "./pdfUtils";

// Accounting Report Types
export interface ExpenseSummaryReport {
  category: string;
  totalAmount: number;
  count: number;
}

export interface ExpenseDetailedReport {
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  createdBy: string;
}

// Profit & Revenue Report Types
export interface RevenueReport {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface GrossProfitReport {
  date: string;
  revenue: number;
  purchases: number;
  grossProfit: number;
}

export interface NetProfitReport {
  date: string;
  revenue: number;
  purchases: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

// Hook to right-align header cells for specific columns
const getDidParseCellHook = (rightAlignColumns: number[]) => {
  return (data: any) => {
    if (
      data.section === "head" &&
      rightAlignColumns.includes(data.column.index)
    ) {
      data.cell.styles.halign = "right";
    }
  };
};

// Export Expense Summary Report
export const exportExpenseSummaryPDF = async (
  data: ExpenseSummaryReport[],
  dateRange: DateRange,
  reportTitle: string = "Expense Summary Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "portrait" });

  const head = [
    ["Category", "Total Amount", "Count"],
  ];
  const body = data.map((item) => [
    item.category,
    formatCurrency(item.totalAmount),
    item.count,
  ]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([1, 2]),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 14, finalY + 12);
  doc.text(`Total Transactions: ${totalCount}`, 14, finalY + 18);

  openPDFInNewTab(doc, reportTitle);
};

// Export Expense Detailed Report
export const exportExpenseDetailedPDF = async (
  data: ExpenseDetailedReport[],
  dateRange: DateRange,
  reportTitle: string = "Expense Detailed Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Payment Method",
      "Created By",
    ],
  ];
  const body = data.map((item) => [
    formatDate(item.date),
    item.description,
    item.category,
    formatCurrency(item.amount),
    item.paymentMethod,
    item.createdBy,
  ]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([3]),
    columnStyles: {
      3: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add grand total
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 14, finalY + 12);

  openPDFInNewTab(doc, reportTitle);
};

// Export Revenue Report
export const exportRevenuePDF = async (
  data: RevenueReport[],
  dateRange: DateRange,
  reportTitle: string = "Revenue Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    ["Date", "Revenue", "Order Count"],
  ];
  const body = data.map((item) => [
    item.date,
    formatCurrency(item.revenue),
    item.orderCount,
  ]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([1, 2]),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Revenue: ${formatCurrency(grandTotal)}`, 14, finalY + 12);
  doc.text(`Total Orders: ${totalOrders}`, 14, finalY + 18);

  openPDFInNewTab(doc, reportTitle);
};

// Export Gross Profit Report
export const exportGrossProfitPDF = async (
  data: GrossProfitReport[],
  dateRange: DateRange,
  reportTitle: string = "Gross Profit Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    ["Date", "Revenue", "Purchases (COGS)", "Gross Profit"],
  ];
  const body = data.map((item) => [
    item.date,
    formatCurrency(item.revenue),
    formatCurrency(item.purchases),
    formatCurrency(item.grossProfit),
  ]);

  // Calculate grand totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = data.reduce((sum, item) => sum + item.purchases, 0);
  const totalGrossProfit = data.reduce((sum, item) => sum + item.grossProfit, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([1, 2, 3]),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, finalY + 12);
  doc.text(`Total Purchases: ${formatCurrency(totalPurchases)}`, 14, finalY + 18);
  doc.text(`Total Gross Profit: ${formatCurrency(totalGrossProfit)}`, 14, finalY + 24);

  openPDFInNewTab(doc, reportTitle);
};

// Export Net Profit Report
export const exportNetProfitPDF = async (
  data: NetProfitReport[],
  dateRange: DateRange,
  reportTitle: string = "Net Profit Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    ["Date", "Revenue", "Purchases", "Expenses", "Gross Profit", "Net Profit"],
  ];
  const body = data.map((item) => [
    item.date,
    formatCurrency(item.revenue),
    formatCurrency(item.purchases),
    formatCurrency(item.expenses),
    formatCurrency(item.grossProfit),
    formatCurrency(item.netProfit),
  ]);

  // Calculate grand totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = data.reduce((sum, item) => sum + item.purchases, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalGrossProfit = data.reduce((sum, item) => sum + item.grossProfit, 0);
  const totalNetProfit = data.reduce((sum, item) => sum + item.netProfit, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([1, 2, 3, 4, 5]),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, finalY + 12);
  doc.text(`Total Purchases: ${formatCurrency(totalPurchases)}`, 14, finalY + 18);
  doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, finalY + 24);
  doc.text(`Total Gross Profit: ${formatCurrency(totalGrossProfit)}`, 14, finalY + 30);
  doc.text(`Total Net Profit: ${formatCurrency(totalNetProfit)}`, 14, finalY + 36);

  openPDFInNewTab(doc, reportTitle);
};

// Generic accounting report exporter
export const exportAccountingReport = async (
  reportType: string,
  data: any[],
  dateRange: DateRange,
  reportTitle: string
) => {
  switch (reportType) {
    case "expense-summary":
      await exportExpenseSummaryPDF(data as ExpenseSummaryReport[], dateRange, reportTitle);
      break;
    case "expense-detailed":
      await exportExpenseDetailedPDF(data as ExpenseDetailedReport[], dateRange, reportTitle);
      break;
    case "revenue":
      await exportRevenuePDF(data as RevenueReport[], dateRange, reportTitle);
      break;
    case "gross-profit":
      await exportGrossProfitPDF(data as GrossProfitReport[], dateRange, reportTitle);
      break;
    case "net-profit":
      await exportNetProfitPDF(data as NetProfitReport[], dateRange, reportTitle);
      break;
    default:
      console.error("Unknown accounting report type:", reportType);
  }
};