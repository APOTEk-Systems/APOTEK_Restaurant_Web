import jsPDF from "jspdf";
import { format } from "date-fns";
import { Order } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";

const MM_TO_PT = 2.83465;
const RECEIPT_WIDTH_MM = 80;
const RECEIPT_WIDTH_PT = RECEIPT_WIDTH_MM * MM_TO_PT;

const PAPER_SIZES: Record<string, { widthMM: number; heightMM: number }> = {
  a5: { widthMM: 148, heightMM: 210 },
  thermal_80: { widthMM: 80, heightMM: 841.89 },
  thermal_58: { widthMM: 58, heightMM: 841.89 },
};

export const generateBillReceipt = async (order: Order, type: 'bill' | 'receipt' = 'bill'): Promise<jsPDF> => {
  const settings = await settingsService.getAllSettings();
  const paperSize = settings.paper_size || 'thermal_80';
  const size = PAPER_SIZES[paperSize] || PAPER_SIZES['thermal_80'];
  const widthPt = size.widthMM * MM_TO_PT;
  const heightPt = size.heightMM * MM_TO_PT;

  const doc = new jsPDF({
    unit: 'pt',
    format: [widthPt, heightPt],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  let yPos = 20;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(type.toUpperCase(), centerX, yPos, { align: "center" });
  yPos += 26;

  if (settings.restaurant_name) {
    doc.text(settings.restaurant_name, centerX, yPos, { align: "center" });
    yPos += 24;
  }

  if (settings.phone_number) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(`Tel: ${settings.phone_number}`, centerX, yPos, { align: "center" });
    yPos += 22;
  }

  doc.setFontSize(11);
  doc.text("=================================", centerX, yPos, { align: "center" });
  yPos += 22;

  doc.text(`Order #${order.orderNumber}`, 20, yPos);
  doc.text(format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"), pageWidth - 20, yPos, { align: "right" });
  yPos += 24;

  if (order.tableNumber) {
    doc.text(`Table: ${order.tableNumber}`, 20, yPos);
    yPos += 22;
  }

  if (order.waiter) {
    doc.text(`Waiter: ${order.waiter}`, 20, yPos);
    yPos += 22;
  }

  doc.text("=================================", centerX, yPos, { align: "center" });
  yPos += 26;

  doc.text("Item", 20, yPos);
  doc.text("Qty", pageWidth - 80, yPos, { align: "center" });
  doc.text("Price", pageWidth - 20, yPos, { align: "right" });
  yPos += 22;

  doc.setFontSize(12);

  const activeItems = order.orderItems.filter(item => item.status !== 'CANCELLED');
  const itemSubtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  activeItems.forEach(item => {
    const itemName = item.menuItem?.name || 'Item';
    const nameLines = doc.splitTextToSize(itemName, pageWidth - 100);
    const textHeight = Math.max(nameLines.length * 14, 18);
    const baselineY = yPos + textHeight - 6;

    doc.text(nameLines, 20, yPos);
    doc.text(`${item.quantity}`, pageWidth - 80, baselineY, { align: "center" });
    doc.text(`${item.price.toLocaleString()}`, pageWidth - 20, baselineY, { align: "right" });

    yPos += textHeight + 10;
  });

  yPos += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("=================================", centerX, yPos, { align: "center" });
  yPos += 26;

  const taxRate = parseFloat(settings.tax_rate || '0') || 0;

  if (taxRate > 0) {
    const vatAmount = itemSubtotal * (taxRate / 100);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 20, yPos);
    doc.text(`${itemSubtotal.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" });
    yPos += 22;

    doc.text(`VAT (${taxRate}%)`, 20, yPos);
    doc.text(`${vatAmount.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" });
    yPos += 22;

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 20, yPos);
    doc.text(`${order.total.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" });
    yPos += 30;
  } else {
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 20, yPos);
    doc.text(`${order.total.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" });
    yPos += 28;
  }

  const receiptFooter = settings.receipt_footer;
  if (receiptFooter) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const footerLines = doc.splitTextToSize(receiptFooter, pageWidth - 40);
    doc.text(footerLines, centerX, yPos, { align: "center" });
    yPos += footerLines.length * 14 + 14;
  }

  doc.setFontSize(11);
  doc.text("Thank you for your visit!", centerX, yPos, { align: "center" });

  return doc;
};

const printDocument = async (order: Order, type: 'bill' | 'receipt', filename: string) => {
  const doc = await generateBillReceipt(order, type);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const printReceipt = async (order: Order) => {
  return printDocument(order, 'receipt', `receipt-order-${order.orderNumber}.pdf`);
};

export const printBill = async (order: Order) => {
  return printDocument(order, 'bill', `bill-order-${order.orderNumber}.pdf`);
};