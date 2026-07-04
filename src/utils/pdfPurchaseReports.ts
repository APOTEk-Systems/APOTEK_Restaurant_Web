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

// Purchase report interfaces
export interface GoodsReceivedReport {
  supplier: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedDate: string;
  receivedBy: string;
}

export interface PurchaseOrderDetailedReport {
  orderNumber: string;
  date: string;
  status: string;
  supplier: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdBy?: string;
}

export interface PurchaseOrderSummaryReport {
  orderNumber: string;
  date: string;
  supplier: string;
  status: string;
  total: number;
  createdBy?: string;
}

export interface SupplierReport {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

type PurchaseReportData =
  | GoodsReceivedReport[]
  | PurchaseOrderDetailedReport[]
  | PurchaseOrderSummaryReport[]
  | SupplierReport[];

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

// Export Goods Received Report - Landscape
export const exportGoodsReceivedPDF = async (
  data: GoodsReceivedReport[],
  dateRange: DateRange,
  reportTitle: string = "Goods Received Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    [
      "Supplier",
      "Item Name",
      "Qty",
      "Unit Price",
      "Total",
      "Received Date",
      "Received By",
    ],
  ];
  const body = data.map((item) => [
    item.supplier,
    item.itemName,
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
    formatDate(item.receivedDate),
    item.receivedBy,
  ]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([2, 3, 4]), // Qty, Unit Price, Total
    columnStyles: {
      2: { cellWidth: 15 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Items Received: ${data.length}`, 14, finalY + 10);
  doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 16);
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 14, finalY + 22);

  openPDFInNewTab(doc, reportTitle);
};

// Export Purchase Order Detailed Report - Landscape
export const exportPurchaseOrderDetailedPDF = async (
  data: PurchaseOrderDetailedReport[],
  dateRange: DateRange,
  reportTitle: string = "Purchase Order Detailed Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    [
      "Order #",
      "Date",
      "Status",
      "Supplier",
      "Item",
      "Qty",
      "Unit Price",
      "Total",
    ],
  ];
  const body = data.map((item) => [
    item.orderNumber,
    formatDate(item.date),
    item.status,
    item.supplier,
    item.item,
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
  ]);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([6, 7]), // Qty, Unit Price, Total
    columnStyles: {
      6: { halign: "right" },
      7: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Items: ${data.length}`, 14, finalY + 12);
  doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 18);
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 14, finalY + 24);

  openPDFInNewTab(doc, reportTitle);
};

// Export Purchase Order Summary Report - Landscape
export const exportPurchaseOrderSummaryPDF = async (
  data: PurchaseOrderSummaryReport[],
  dateRange: DateRange,
  reportTitle: string = "Purchase Order Summary Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ });

  const head = [
    ["Order #", "Date", "Supplier", "Status", "Total"],
  ];
  const body = data.map((item) => [
    item.orderNumber,
    formatDate(item.date),
    item.supplier,
    item.status,
    formatCurrency(item.total),
    
  ]);

// Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
  const statusCounts = {
    PENDING: data.filter(item => item.status === "PENDING").length,
    APPROVED: data.filter(item => item.status === "APPROVED").length,
    REJECTED: data.filter(item => item.status === "REJECTED").length,
  };

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([4]), // Total
    columnStyles: {
    
      4: { halign: "right" },
    
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Orders: ${data.length}`, 14, finalY + 12);
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 14, finalY + 18);
  doc.text(`Pending: ${statusCounts.PENDING}, Approved: ${statusCounts.APPROVED}, Rejected: ${statusCounts.REJECTED}`, 14, finalY + 24);

  openPDFInNewTab(doc, reportTitle);
};

// Export Suppliers List Report - Portrait
export const exportSuppliersListPDF = async (
  data: SupplierReport[],
  dateRange: DateRange,
  reportTitle: string = "Suppliers List Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "portrait" });

  const head = [["Name", "Contact Person", "Email", "Phone", "Address"]];
  const body = data.map((item) => [
    item.name,
    item.contactPerson,
    item.email,
    item.phone,
    item.address,
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: "auto" },
    },
    ...defaultTableStyles,
  });

  openPDFInNewTab(doc, reportTitle);
};

// Generic purchase report exporter
export const exportPurchaseReport = async (
  reportType: string,
  data: PurchaseReportData,
  dateRange: DateRange,
  reportTitle: string
) => {
  switch (reportType) {
    case "goods-received":
      await exportGoodsReceivedPDF(
        data as GoodsReceivedReport[],
        dateRange,
        reportTitle
      );
      break;
    case "purchase-detailed":
      await exportPurchaseOrderDetailedPDF(
        data as PurchaseOrderDetailedReport[],
        dateRange,
        reportTitle
      );
      break;
    case "purchase-summary":
      await exportPurchaseOrderSummaryPDF(
        data as PurchaseOrderSummaryReport[],
        dateRange,
        reportTitle
      );
      break;
    case "suppliers":
      await exportSuppliersListPDF(
        data as SupplierReport[],
        dateRange,
        reportTitle
      );
      break;
    default:
      console.error("Unknown report type:", reportType);
  }
};
