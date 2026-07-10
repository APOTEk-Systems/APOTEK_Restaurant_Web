import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { settingsService, RestaurantSettings } from "@/services/settingsService";

// Format date for display
export const formatDate = (date: string | Date) => {
  return format(new Date(date), "dd/MM/yyyy");
};

// Format currency
export const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Function to fetch company settings
export const getCompanySettings = async (): Promise<RestaurantSettings> => {
  try {
    const settings = await settingsService.getAllSettings();
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
};

// Default table styles
export const defaultTableStyles = {
  theme: 'striped' as const,
  headStyles: {
    fillColor: [32, 95, 44] as [number, number, number],
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
  },
  styles: {
    fontSize: 9,
    cellPadding: 3,
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245] as [number, number, number],
  },
};

// Column styles for right-aligning numeric columns
export const priceColumnStyles = {
  halign: 'right' as const,
};

// Function to add centered company header to PDF
export const addCompanyHeader = async (doc: jsPDF, settings: RestaurantSettings) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  
  let yPosition = 5;
  
  // Add logo if exists (centered)
  if (settings.logo) {
    try {
      doc.addImage(settings.logo, 'PNG', centerX - 15, yPosition, 30, 30);
      yPosition = 40;
    } catch (error) {
      console.error("Error adding logo:", error);
      yPosition = 15;
    }
  }
  
  // Restaurant name - centered
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(settings.restaurant_name || "Restaurant", centerX, yPosition, { align: "center" });
  
  // Contact info - centered
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let contactY = yPosition + 6;
  
  const contactLines: string[] = [];
  if (settings.phone_number) {
    contactLines.push(`Tel: ${settings.phone_number}`);
  }
  if (settings.email_address) {
    contactLines.push(`Email: ${settings.email_address}`);
  }
  if (settings.website) {
    contactLines.push(`Website: ${settings.website}`);
  }
  
  contactLines.forEach((line) => {
    doc.text(line, centerX, contactY, { align: "center" });
    contactY += 5;
  });
  
  return contactY + 3;
};

// Function to add report info (date range and printed at) - centered
export const addReportInfo = (doc: jsPDF, reportTitle: string, dateRange: DateRange, startY: number, filters?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  
  let yPosition = startY;
  
  // Report title - centered
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, centerX, yPosition, { align: "center" });
  yPosition += 6;
  
  // Date range - centered
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateRangeText = dateRange.from && dateRange.to 
    ? `Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : "Period: All Time";
  doc.text(dateRangeText, centerX, yPosition, { align: "center" });
  yPosition += 6;
  
  // Filters - centered
  if (filters) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Filters: ${filters}`, centerX, yPosition, { align: "center" });
    yPosition += 5;
  }
  
  // Printed at - centered
  const printedAt = `Printed at: ${format(new Date(), 'PPP p')}`;
  doc.text(printedAt, centerX, yPosition, { align: "center" });
  
  return yPosition + 5;
};

// Helper function to add table to PDF
export const addPDFTable = (
  doc: jsPDF,
  columns: { header: string; dataKey: string; styles?: any }[],
  tableData: any[],
  startY: number
) => {
  // Extract column styles
  const columnStyles: Record<number, any> = {};
  columns.forEach((col, index) => {
    if (col.styles) {
      columnStyles[index] = col.styles;
    }
  });

  autoTable(doc, {
    startY,
    head: [columns.map(col => col.header)],
    body: tableData.map(row => columns.map(col => row[col.dataKey])),
    columnStyles,
    ...defaultTableStyles,
  });
};

// Helper function to open PDF in new tab
export const previewBlob = (blob: Blob, filename: string) => {
  try {
    // Convert blob to data URL with proper MIME type
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Replace the generic data URL with proper application/pdf MIME type
      const pdfDataUrl = dataUrl.replace(
        'data:application/octet-stream',
        'data:application/pdf'
      );

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename.replace('.pdf', '')}</title>
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  overflow: hidden;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  display: block;
                }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUrl}"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error in previewBlob:', error);
  }
};

// Helper function to open PDF in new tab using blob
export const openPDFInNewTab = (doc: jsPDF, reportTitle: string) => {
  const pdfBlob = doc.output('blob');
  const fileName = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  previewBlob(pdfBlob, fileName);
};