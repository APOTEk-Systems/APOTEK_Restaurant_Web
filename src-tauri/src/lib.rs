
use std::process::Command;
use std::fs;
use std::env;
use chrono::Local;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct OrderItem {
    #[serde(rename = "menuItem")]
    menu_item: MenuItem,
    quantity: f64,
    price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct MenuItem {
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Order {
    #[serde(rename = "orderNumber")]
    order_number: i32,
    #[serde(rename = "customerName")]
    customer_name: Option<String>,
    #[serde(rename = "tableNumber")]
    table_number: i32,
    waiter: Option<String>,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "orderItems")]
    order_items: Vec<OrderItem>,
    total: f64,
}

/// Format order into 58mm receipt text
fn format_receipt(order: &Order) -> String {
    let width = 32;
    let dotted_line = "-".repeat(width);
    let mut receipt = String::new();

    // 1. Header (Centered)
    let header = "APOTEK Restaurant";
    let padding = if width > header.len() { (width - header.len()) / 2 } else { 0 };
    receipt.push_str(&format!("{}{}\n", " ".repeat(padding), header));

    let address = "123 Main Street, Anytown";
    let padding = if width > address.len() { (width - address.len()) / 2 } else { 0 };
    receipt.push_str(&format!("{}{}\n", " ".repeat(padding), address));

    let tel = "Tel: 123-456-7890";
    let padding = if width > tel.len() { (width - tel.len()) / 2 } else { 0 };
    receipt.push_str(&format!("{}{}\n", " ".repeat(padding), tel));

    receipt.push_str(&dotted_line);
    receipt.push('\n');

    // 2. Order Info
    receipt.push_str(&format!("Order: #{}\n", order.order_number));
    receipt.push_str(&format!("Table: {}\n", order.table_number));
    if let Some(waiter) = &order.waiter {
        receipt.push_str(&format!("Waiter: {}\n", waiter));
    }
    
    // Parse datetime
    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&order.created_at) {
        let local = dt.with_timezone(&Local);
        receipt.push_str(&format!("Date: {}\n", local.format("%m/%d/%Y %H:%M")));
    }

    receipt.push_str(&dotted_line);
    receipt.push('\n');

    // 3. Column Headers
    receipt.push_str(&format!("{:<14} {:>6} {:>6} {:>5}\n", "Item", "Qty", "Price", "Total"));
    receipt.push_str(&dotted_line);
    receipt.push('\n');

    // 4. Items
    for item in &order.order_items {
        let name = &item.menu_item.name;
        let qty = item.quantity as i32;
        let item_total = item.quantity * item.price;

        // Truncate name if too long
        let display_name = if name.len() > 14 {
            format!("{}...", &name[..11])
        } else {
            name.to_string()
        };

        receipt.push_str(&format!(
            "{:<14} {:>6} {:>6.2} {:>5.2}\n",
            display_name, qty, item.price, item_total
        ));
    }

    receipt.push_str(&dotted_line);
    receipt.push('\n');

    // 5. Totals
    let subtotal_label = "Subtotal:";
    let subtotal_value = format!("${:.2}", order.total);
    let padding = width.saturating_sub(subtotal_label.len() + subtotal_value.len() + 1);
    receipt.push_str(&format!("{}{}{}\n", subtotal_label, " ".repeat(padding), subtotal_value));

    let tax_label = "Tax (0%):";
    let tax_value = "$0.00";
    let padding = width.saturating_sub(tax_label.len() + tax_value.len() + 1);
    receipt.push_str(&format!("{}{}{}\n", tax_label, " ".repeat(padding), tax_value));

    receipt.push_str(&dotted_line);
    receipt.push('\n');

    let total_label = "TOTAL:";
    let total_value = format!("${:.2}", order.total);
    let padding = width.saturating_sub(total_label.len() + total_value.len() + 1);
    receipt.push_str(&format!("{}{}{}\n", total_label, " ".repeat(padding), total_value));

    receipt.push('\n');

    // 6. Footer (Centered)
    let footer = "Thank you for dining!";
    let padding = if width > footer.len() { (width - footer.len()) / 2 } else { 0 };
    receipt.push_str(&format!("{}{}\n", " ".repeat(padding), footer));

    // 7. Bottom margin for cutter
    receipt.push_str("\n\n\n\n\n");

    receipt
}

/// Get the default printer name on Windows
#[tauri::command]
fn get_default_printer() -> Result<String, String> {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            "$ErrorActionPreference = 'Stop'; Get-CimInstance Win32_Printer | Where-Object Default | Select-Object -First 1 -ExpandProperty Name",
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if output.status.success() {
        let printer_name = String::from_utf8_lossy(&output.stdout)
            .trim()
            .to_string();
        
        if printer_name.is_empty() {
            Err("No default printer found. Please set a default printer in Windows settings.".to_string())
        } else {
            Ok(printer_name)
        }
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to get default printer: {}", stderr))
    }
}

/// Silent print to Windows printer using .NET PrintDocument
/// This is the most reliable method as it allows explicit control over margins and fonts
#[tauri::command]
fn print_receipt_silent(
    order: Order,
    printer_name: Option<String>,
) -> Result<String, String> {
    // 1. Format receipt from order data
    let receipt_text = format_receipt(&order);
    if receipt_text.is_empty() {
        return Err("Failed to format receipt".to_string());
    }

    // 2. Get printer name
    let printer = if let Some(name) = printer_name.filter(|n| !n.is_empty()) {
        name
    } else {
        get_default_printer()?
    };

    // 3. Create temporary file on C:\temp
    let temp_dir = std::path::PathBuf::from("C:\\temp");
    if !temp_dir.exists() {
        let _ = fs::create_dir_all(&temp_dir);
    }
    let temp_file_path = temp_dir.join(format!("receipt_{}.txt", Local::now().timestamp()));

    fs::write(&temp_file_path, &receipt_text)
        .map_err(|e| format!("Failed to create temporary file: {}", e))?;

    // 4. Use .NET PrintDocument via PowerShell
    // This allows us to set margins to 0 and use a fixed-width font
    let ps_command = format!(
        "$ErrorActionPreference = 'Stop'; \
         Add-Type -AssemblyName 'System.Drawing'; \
         $doc = New-Object System.Drawing.Printing.PrintDocument; \
         $doc.PrinterSettings.PrinterName = '{}'; \
         $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0); \
         $text = [System.IO.File]::ReadAllText('{}'); \
         $script = {{ \
             param($sender, $ev); \
             $font = New-Object System.Drawing.Font('Courier New', 9); \
             $ev.Graphics.DrawString($text, $font, [System.Drawing.Brushes]::Black, 0, 0); \
         }}; \
         $doc.add_PrintPage($script); \
         $doc.Print()",
        printer,
        temp_file_path.display()
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &ps_command])
        .output()
        .map_err(|e| format!("Failed to execute .NET print command: {}", e))?;

    // 5. Clean up
    let _ = fs::remove_file(&temp_file_path);

    // 6. Return result
    if output.status.success() {
        Ok(format!(
            "Successfully sent to printer: {}",
            printer
        ))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Printing failed: {}. Tip: Ensure the printer driver is installed correctly.", stderr))
    }
}

/// Alternative method: Direct printing via Out-Printer cmdlet
#[tauri::command]
fn print_receipt_direct(
    order: Order,
    printer_name: Option<String>,
) -> Result<String, String> {
    // 1. Format receipt from order data
    let receipt_text = format_receipt(&order);
    if receipt_text.is_empty() {
        return Err("Failed to format receipt".to_string());
    }

    // 2. Get printer name
    let printer = if let Some(name) = printer_name.filter(|n| !n.is_empty()) {
        name
    } else {
        get_default_printer()?
    };

    // 3. Create temporary file
    let temp_dir = std::path::PathBuf::from("C:\\temp");
    if !temp_dir.exists() {
        let _ = fs::create_dir_all(&temp_dir);
    }
    let temp_file_path = temp_dir.join(format!("receipt_{}.txt", Local::now().timestamp()));

    // Use specific encoding for better compatibility with thermal printers
    fs::write(&temp_file_path, &receipt_text)
        .map_err(|e| format!("Failed to create temporary file: {}", e))?;

    // 4. Use PowerShell Out-Printer directly with better error handling
    let ps_command = format!(
        "$ErrorActionPreference = 'Stop'; Get-Content -Path '{}' -Raw | Out-Printer -Name '{}'",
        temp_file_path.display(),
        printer
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-NoLogo", "-Command", &ps_command])
        .output()
        .map_err(|e| format!("Failed to execute print command: {}", e))?;

    // 5. Clean up
    let _ = fs::remove_file(&temp_file_path);

    // 6. Return result
    if output.status.success() {
        Ok(format!(
            "Bill printed successfully to: {}",
            printer
        ))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Print command failed: {}. This often happens with thermal printers due to margin issues. Try setting the printer as default and using the alternative print method.", stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            print_receipt_silent,
            print_receipt_direct,
            get_default_printer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}