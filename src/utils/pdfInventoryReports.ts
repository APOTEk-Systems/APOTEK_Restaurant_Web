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

// Inventory Report Types
export interface InventorySummaryReport {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  location: string;
}

export interface LowStockReport {
  itemName: string;
  category: string;
  currentQuantity: number;
  minStock: number;
  unit: string;
  status: string;
}

export interface InventoryAdjustmentReport {
  date: string;
  itemName: string;
  adjustmentType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  notes: string;
}

export interface InventoryRequestReport {
  requestId: string;
  date: string;
  requestedFrom: string;
  requestedBy: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
}

export interface ExpiringBatchReport {
  batchNumber: string;
  itemName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysLeft: number;
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

// Export Inventory Summary Report
export const exportInventorySummaryPDF = async (
  data: InventorySummaryReport[],
  dateRange: DateRange,
  reportTitle: string = "Inventory Summary Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF();

  const head = [
    [
      "Item Name",
      "Category",
      "Qty",
      "Unit",
      "Unit Price",
    ],
  ];
  const body = data.map((item) => [
    item.itemName,
    item.category,
    item.quantity,
    item.unit,
    formatCurrency(item.unitPrice),
  ]);

  // Calculate totals
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([2, 4, 5]),
    columnStyles: {
    
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(10);
  doc.text(`Total Items: ${data.length}`, 14, finalY + 10);
  doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 16);
  doc.text(`Total Value: ${formatCurrency(totalValue)}`, 14, finalY + 22);

  openPDFInNewTab(doc, reportTitle);
};

// Export Low Stock Report
export const exportLowStockPDF = async (
  data: LowStockReport[],
  dateRange: DateRange,
  reportTitle: string = "Low Stock Items Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "portrait" });

  const head = [
    [
      "Item Name",
      "Category",
      "Current Qty",
      "Min Stock",
      "Unit",
      "Status",
    ],
  ];
  const body = data.map((item) => [
    item.itemName,
    item.category,
    item.currentQuantity,
    item.minStock,
    item.unit,
    item.status,
  ]);

  // Count by status
  const outOfStock = data.filter((item) => item.status === "OUT OF STOCK").length;
  const critical = data.filter((item) => item.status === "CRITICAL").length;
  const low = data.filter((item) => item.status === "LOW").length;

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([2, 3]),
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add status summary
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  doc.setFontSize(10);
  doc.text(`Total Low Stock Items: ${data.length}`, 14, finalY + 10);
  doc.text(`Out of Stock: ${outOfStock}`, 14, finalY + 16);
  doc.text(`Critical: ${critical}`, 14, finalY + 22);
  doc.text(`Low: ${low}`, 14, finalY + 28);

  openPDFInNewTab(doc, reportTitle);
};

// Export Inventory Adjustments Report
export const exportInventoryAdjustmentsPDF = async (
  data: InventoryAdjustmentReport[],
  dateRange: DateRange,
  reportTitle: string = "Inventory Adjustments Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    [
      "Date",
      "Item Name",
      "Type",
      "Qty",
      "Previous",
      "New",
      "Reason",
      "Adjusted By",
    ],
  ];
  const body = data.map((item) => [
    formatDate(item.date),
    item.itemName,
    item.adjustmentType,
    item.quantity,
    item.previousQuantity,
    item.newQuantity,
    item.reason,
    item.adjustedBy,
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([3, 4, 5]),
    columnStyles: {
     
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Adjustments: ${data.length}`, 14, finalY + 10);
  doc.text(`Total Quantity Adjusted: ${totalQty}`, 14, finalY + 16);

  openPDFInNewTab(doc, reportTitle);
};

// Export Inventory Requests Report
export const exportInventoryRequestsPDF = async (
  data: InventoryRequestReport[],
  dateRange: DateRange,
  reportTitle: string = "Inventory Requests Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "landscape" });

  const head = [
    [
      "Request ID",
      "Date",
      "Requested From",
      "Requested By",
      "Item Name",
      "Qty",
      "Unit",
      "Status",
    ],
  ];
  const body = data.map((item) => [
    item.requestId,
    formatDate(item.date),
    item.requestedFrom,
    item.requestedBy,
    item.itemName,
    item.quantity,
    item.unit,
    item.status,
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([5]),
    columnStyles: {
      5: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
  const statusCounts = {
    PENDING: data.filter(item => item.status === "PENDING").length,
    APPROVED: data.filter(item => item.status === "APPROVED").length,
    REJECTED: data.filter(item => item.status === "REJECTED").length,
  };
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Requests: ${data.length}`, 14, finalY + 10);
  doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 16);
  doc.text(`Pending: ${statusCounts.PENDING}, Approved: ${statusCounts.APPROVED}, Rejected: ${statusCounts.REJECTED}`, 14, finalY + 22);

  openPDFInNewTab(doc, reportTitle);
};

// Export Expiring Batches Report
export const exportExpiringBatchesPDF = async (
  data: ExpiringBatchReport[],
  dateRange: DateRange,
  reportTitle: string = "Expiring Batches Report"
) => {
  const settings = await getCompanySettings();
  const doc = new jsPDF({ orientation: "portrait" });

  const head = [
    ["Batch #", "Item Name", "Qty", "Unit", "Expiry Date", "Days Left"],
  ];
  const body = data.map((item) => [
    item.batchNumber,
    item.itemName,
    item.quantity,
    item.unit,
    formatDate(item.expiryDate),
    item.daysLeft,
  ]);

  const headerEndY = await addCompanyHeader(doc, settings);
  const reportInfoEndY = addReportInfo(doc, reportTitle, dateRange, headerEndY);

  autoTable(doc, {
    startY: reportInfoEndY,
    head,
    body,
    didParseCell: getDidParseCellHook([2, 5]),
    columnStyles: {
      2: { halign: "right" },
      5: { halign: "right" },
    },
    ...defaultTableStyles,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || reportInfoEndY;
  const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Expiring Batches: ${data.length}`, 14, finalY + 10);
  doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 16);

  openPDFInNewTab(doc, reportTitle);
};

// Generic inventory report exporter
export const exportInventoryReport = async (
  reportType: string,
  data: any[],
  dateRange: DateRange,
  reportTitle: string
) => {
  switch (reportType) {
    case "inventory-summary":
      await exportInventorySummaryPDF(data as InventorySummaryReport[], dateRange, reportTitle);
      break;
    case "low-stock":
      await exportLowStockPDF(data as LowStockReport[], dateRange, reportTitle);
      break;
    case "adjustments":
      await exportInventoryAdjustmentsPDF(data as InventoryAdjustmentReport[], dateRange, reportTitle);
      break;
    case "requests":
      await exportInventoryRequestsPDF(data as InventoryRequestReport[], dateRange, reportTitle);
      break;
    case "expiring-batches":
      await exportExpiringBatchesPDF(data as ExpiringBatchReport[], dateRange, reportTitle);
      break;
    default:
      console.error("Unknown inventory report type:", reportType);
  }
};