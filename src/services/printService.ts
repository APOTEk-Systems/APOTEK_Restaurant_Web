import { invoke } from '@tauri-apps/api/core';

interface OrderItem {
  menuItem: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  orderNumber: string;
  customerName?: string;
  tableNumber: number;
  waiter?: string;
  createdAt: string;
  orderItems: OrderItem[];
  total: number;
}

/**
 * Print bill silently to default or specified printer
 * Passes order data to Rust backend which formats and prints it
 * @param order - Order object containing all order details
 * @param printerName - Optional printer name (uses default if not specified)
 */
async function printBillSilent(order: Order, printerName?: string): Promise<void> {
  try {
    const result = await invoke<string>('print_receipt_silent', {
      order,
      printerName: printerName || null,
    });
    
    console.log('Print result:', result);
  } catch (error) {
    console.error('Silent print error:', error);
    throw new Error(`Failed to print bill: ${error}`);
  }
}

/**
 * Alternative print method using direct PowerShell approach
 */
async function printBillDirect(order: Order, printerName?: string): Promise<void> {
  try {
    const result = await invoke<string>('print_receipt_direct', {
      order,
      printerName: printerName || null,
    });
    
    console.log('Print result:', result);
  } catch (error) {
    console.error('Direct print error:', error);
    throw new Error(`Failed to print bill directly: ${error}`);
  }
}

/**
 * Get the default printer name
 */
async function getDefaultPrinter(): Promise<string> {
  try {
    const printerName = await invoke<string>('get_default_printer');
    return printerName;
  } catch (error) {
    console.error('Failed to get default printer:', error);
    throw new Error('Unable to detect default printer');
  }
}

export const PrintService = {
  printBillSilent,
  printBillDirect,
  getDefaultPrinter,
};