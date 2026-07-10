import { invoke } from '@tauri-apps/api/core';
import { SettingsService } from './settingsService';

interface OrderItem {
  menuItem?: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  orderNumber: number;
  customerName?: string;
  tableNumber: number;
  waiter?: string;
  createdAt: string;
  orderItems: OrderItem[];
  total: number;
}

interface RestaurantInfo {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

interface PrintableOrder extends Order {
  receiptTitle: string;
  restaurantInfo: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    receipt_header?: string;
    receipt_footer?: string;
  };
}

interface DocketItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface Docket {
  title: string;
  orderNumber: number;
  tableNumber: number;
  waiter?: string;
  customerName?: string;
  createdAt: string;
  items: DocketItem[];
}

type CancelPrintableOrder = Order & {
  orderItems: Array<OrderItem & { notes?: string | null; prepArea?: string | null }>;
};

let restaurantInfoPromise: Promise<RestaurantInfo> | null = null;

async function getRestaurantInfo(): Promise<RestaurantInfo> {
  if (!restaurantInfoPromise) {
    restaurantInfoPromise = SettingsService.getAllSettings()
      .then((settings) => {
        const addressParts = [
          settings.address_line_1,
          settings.address_line_2,
          settings.city,
          settings.state,
          settings.country,
        ].filter((value): value is string => Boolean(value && value.trim()));

        return {
          name: settings.restaurant_name || undefined,
          phone: settings.phone_number || undefined,
          email: settings.email_address || undefined,
          website: settings.website || undefined,
          address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
          receiptHeader: settings.receipt_header || undefined,
          receiptFooter: settings.receipt_footer || undefined,
        };
      })
      .catch((error) => {
        console.warn('Failed to load restaurant settings for receipt printing:', error);
        restaurantInfoPromise = null;
        return {};
      });
  }

  return restaurantInfoPromise;
}

async function buildPrintableOrder(order: Order, receiptTitle: string): Promise<PrintableOrder> {
  const restaurantInfo = await getRestaurantInfo();

  return {
    ...order,
    receiptTitle,
    restaurantInfo: {
      name: restaurantInfo.name,
      phone: restaurantInfo.phone,
      email: restaurantInfo.email,
      website: restaurantInfo.website,
      address: restaurantInfo.address,
      receipt_header: restaurantInfo.receiptHeader,
      receipt_footer: restaurantInfo.receiptFooter,
    },
  };
}

/**
 * Print receipt silently to default or specified printer
 * Passes order data to Rust backend which formats and prints it
 * @param order - Order object containing all order details
 * @param printerName - Optional printer name (uses default if not specified)
 */
async function printReceiptSilent(order: Order, printerName?: string): Promise<void> {
  try {
    const printableOrder = await buildPrintableOrder(order, 'RECEIPT');
    const result = await invoke<string>('print_receipt_silent', {
      order: printableOrder,
      printerName: printerName?.trim() || null,
    });
    
    console.log('Print result:', result);
  } catch (error) {
    console.error('Silent print error:', error);
    throw new Error(`Failed to print receipt: ${error}`);
  }
}

/**
 * Alternative print method using direct PowerShell approach
 */
async function printReceiptDirect(order: Order, printerName?: string): Promise<void> {
  try {
    const printableOrder = await buildPrintableOrder(order, 'RECEIPT');
    const result = await invoke<string>('print_receipt_direct', {
      order: printableOrder,
      printerName: printerName?.trim() || null,
    });

    console.log('Print result:', result);
  } catch (error) {
    console.error('Direct print error:', error);
    throw new Error(`Failed to print receipt directly: ${error}`);
  }
}

async function printBillSilent(order: Order, printerName?: string): Promise<void> {
  try {
    const printableOrder = await buildPrintableOrder(order, 'BILL');
    const result = await invoke<string>('print_receipt_silent', {
      order: printableOrder,
      printerName: printerName?.trim() || null,
    });

    console.log('Print result:', result);
  } catch (error) {
    console.error('Silent bill print error:', error);
    throw new Error(`Failed to print bill: ${error}`);
  }
}

async function printBillDirect(order: Order, printerName?: string): Promise<void> {
  try {
    const printableOrder = await buildPrintableOrder(order, 'BILL');
    const result = await invoke<string>('print_receipt_direct', {
      order: printableOrder,
      printerName: printerName?.trim() || null,
    });

    console.log('Print result:', result);
  } catch (error) {
    console.error('Direct bill print error:', error);
    throw new Error(`Failed to print bill directly: ${error}`);
  }
}

/**
 * Print kitchen or bar docket silently to specified printer
 * @param docket - Docket object containing title and items
 * @param printerName - Printer name
 */
async function printDocketSilent(docket: Docket, printerName?: string): Promise<void> {
  try {
    const result = await invoke<string>('print_docket_silent', {
      docket,
      printerName: printerName?.trim() || null,
    });

    console.log('Docket print result:', result);
  } catch (error) {
    console.error('Docket silent print error:', error);
    throw new Error(`Failed to print docket: ${error}`);
  }
}

/**
 * Alternative docket print method using direct PowerShell approach
 */
async function printDocketDirect(docket: Docket, printerName?: string): Promise<void> {
  try {
    const result = await invoke<string>('print_docket_direct', {
      docket,
      printerName: printerName?.trim() || null,
    });

    console.log('Docket print result:', result);
  } catch (error) {
    console.error('Docket direct print error:', error);
    throw new Error(`Failed to print docket directly: ${error}`);
  }
}

async function printOrderCancelledDockets(order: CancelPrintableOrder): Promise<void> {
  const kitchenItems = order.orderItems
    .filter((item) => (item.prepArea || "").toUpperCase() !== "BAR")
    .map((item) => ({
      name: item.menuItem?.name || "Item",
      quantity: item.quantity,
      notes: item.notes || undefined,
    }));

  const barItems = order.orderItems
    .filter((item) => (item.prepArea || "").toUpperCase() === "BAR")
    .map((item) => ({
      name: item.menuItem?.name || "Item",
      quantity: item.quantity,
      notes: item.notes || undefined,
    }));

  const dockets: Docket[] = [];

  if (kitchenItems.length > 0) {
    dockets.push({
      title: "ORDER CANCELED - KITCHEN",
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      waiter: order.waiter,
      customerName: order.customerName,
      createdAt: order.createdAt,
      items: kitchenItems,
    });
  }

  if (barItems.length > 0) {
    dockets.push({
      title: "ORDER CANCELED - BAR",
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      waiter: order.waiter,
      customerName: order.customerName,
      createdAt: order.createdAt,
      items: barItems,
    });
  }

  for (const docket of dockets) {
    await printDocketSilent(docket);
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
  printReceiptSilent,
  printReceiptDirect,
  printBillSilent,
  printBillDirect,
  printDocketSilent,
  printDocketDirect,
  printOrderCancelledDockets,
  getDefaultPrinter,
  preloadRestaurantInfo: () => getRestaurantInfo(),
};
