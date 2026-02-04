import { getPrinters, printHtml } from 'tauri-plugin-printer-v2';

interface Order {
  orderNumber: string;
  customerName?: string;
  tableNumber: number;
  waiter?: string;
  createdAt: string;
  orderItems: OrderItem[];
  total: number;
}

interface OrderItem {
  menuItem: {
    name: string;
  };
  quantity: number;
  price: number;
}

export const generateBillHtml = (order: Order): string => {
  const receiptWidth = "58mm"; 
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  const itemsHtml = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="text-align: left;">${item.menuItem.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${item.price.toFixed(2)}</td>
      <td style="text-align: right;">${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="width: ${receiptWidth}; font-family: 'monospace', sans-serif; font-size: 10px; color: #000;">
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 14px;">APOTEK Restaurant</h2>
        <p style="margin: 0;">123 Main Street, Anytown</p>
        <p style="margin: 0;">Tel: 123-456-7890</p>
      </div>
      <div style="margin-bottom: 10px;">
        <p style="margin: 0;"><strong>Order:</strong> #${order.orderNumber}</p>
        <p style="margin: 0;"><strong>Table:</strong> ${order.tableNumber}</p>
        <p style="margin: 0;"><strong>Waiter:</strong> ${order.waiter || 'N/A'}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #000; padding-bottom: 5px;">Item</th>
            <th style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px;">Qty</th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding-bottom: 5px;">Price</th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding-bottom: 5px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="margin-top: 10px; border-top: 1px solid #000; padding-top: 5px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tax (0%):</span>
          <span>$0.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
          <span>Total:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p>Thank you for dining with us!</p>
      </div>
    </div>
  `;
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const printBill = async (order: Order) => {
  const htmlContent = generateBillHtml(order);

  try {
    const printersListJson = await getPrinters();
    const printersList = JSON.parse(printersListJson);

    console.log("Printers:", printersList);

    if (!printersList?.length) {
      throw new Error("No printers found");
    }

    const result = await printHtml({
      html: htmlContent,
      printer: printersList[0].Name, // exact system printer name
      id: generateId(),
      print_settings:"{\"copies\":1,\"orientation\":\"portrait\"}"
    });

    console.log("Printed successfully", result);
  } catch (err) {
    console.error("Print failed:", err);
    alert("Printing failed. Check printer setup.");
  }
};


export const PrintService = {
  printBill,
};