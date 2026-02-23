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
  DateRange
} from "./pdfUtils";

// Order report interfaces
export interface OrderSummary {
  orderNumber: number;
  date: string;
  itemCount: number;
  total: number;
  waiter: string;
}

export interface OrderDetailed {
  date: string;
  orderNumber: number;
  item: string;
  quantity: number;
  price: number;
}

export interface PaymentReport {
  orderNumber: number;
  date: string;
  amount: number;
  paymentMethod: string;
  waiter: string;
}

export interface RefundReport {
  orderNumber: number;
  date: string;
  item: string;
  price: number;
  reason: string;
  waiter: string;
}

type OrderReportData = OrderSummary[] | OrderDetailed[] | PaymentReport[] | RefundReport[];

// Hook to right-align header cells for specific columns
const getDidParseCellHook = (rightAlignColumns: number[]) => {
  return (data: any) => {
    if (data.section === 'head' && rightAlignColumns.includes(data.column.index)) {
      data.cell.styles.halign = 'right';
    }
  };
};

// Export Order Summary Report
export const exportOrderSummaryPDF = async (
  data: OrderSummary[],
  dateRange: DateRange,
  reportTitle: string = "Order Summary Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF();

  const head = [["Order #", "Date", "Waiter", "Items", "Price"]];
  const body = data.map(item => [
    item.orderNumber,
    formatDate(item.date),
    item.waiter,
    item.itemCount,
    formatCurrency(item.total),
    
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([4]),
    columnStyles:{
      4:{halign:"right"}
    }, // Price column
    ...defaultTableStyles,
  });

  openPDFInNewTab(doc, reportTitle);
};

// Export Order Detailed Report
export const exportOrderDetailedPDF = async (
  data: OrderDetailed[],
  dateRange: DateRange,
  reportTitle: string = "Order Detailed Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF();

  const head = [["Date", "Order #", "Item", "Quantity", "Price"]];
  const body = data.map(item => [
    formatDate(item.date),
    item.orderNumber,
    item.item,
    item.quantity,
    formatCurrency(item.price)
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([3, 4]), // Quantity, Price columns
    ...defaultTableStyles,
  });

  openPDFInNewTab(doc, reportTitle);
};

// Export Payments Report
export const exportPaymentsPDF = async (
  data: PaymentReport[],
  dateRange: DateRange,
  reportTitle: string = "Payments Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF();

  const head = [["Order #", "Date", "Amount", "Payment Method", "Waiter"]];
  const body = data.map(item => [
    item.orderNumber,
    formatDate(item.date),
    formatCurrency(item.amount),
    item.paymentMethod,
    item.waiter
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([2]), // Amount column
    ...defaultTableStyles,
  });

  openPDFInNewTab(doc, reportTitle);
};

// Export Refund Report
export const exportRefundsPDF = async (
  data: RefundReport[],
  dateRange: DateRange,
  reportTitle: string = "Refund Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF();

  const head = [["Order #", "Date", "Item", "Price", "Reason", "Waiter"]];
  const body = data.map(item => [
    item.orderNumber,
    formatDate(item.date),
    item.item,
    formatCurrency(item.price),
    item.reason,
    item.waiter
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([3]), // Price column
    ...defaultTableStyles,
  });

  openPDFInNewTab(doc, reportTitle);
};

// Generic order report exporter
export const exportOrderReport = async (
  reportType: string,
  data: OrderReportData,
  dateRange: DateRange,
  reportTitle: string
) => {
  switch (reportType) {
    case "summary":
      await exportOrderSummaryPDF(data as OrderSummary[], dateRange, reportTitle);
      break;
    case "detailed":
      await exportOrderDetailedPDF(data as OrderDetailed[], dateRange, reportTitle);
      break;
    case "payments":
      await exportPaymentsPDF(data as PaymentReport[], dateRange, reportTitle);
      break;
    case "refunds":
      await exportRefundsPDF(data as RefundReport[], dateRange, reportTitle);
      break;
    default:
      console.error("Unknown report type:", reportType);
  }
};