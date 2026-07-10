
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Mutex, OnceLock};
use chrono::Local;
use serde::{Deserialize, Serialize};
use serde_json::Value;

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
    #[serde(rename = "receiptTitle", default)]
    receipt_title: Option<String>,
    #[serde(rename = "restaurantInfo", default)]
    restaurant_info: Option<RestaurantInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
struct RestaurantInfo {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    phone: Option<String>,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    website: Option<String>,
    #[serde(default)]
    address: Option<String>,
    #[serde(default)]
    receipt_header: Option<String>,
    #[serde(default)]
    receipt_footer: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DocketItem {
    name: String,
    quantity: f64,
    notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Docket {
    title: String,
    #[serde(rename = "orderNumber")]
    order_number: i32,
    #[serde(rename = "tableNumber")]
    table_number: i32,
    waiter: Option<String>,
    #[serde(rename = "customerName")]
    customer_name: Option<String>,
    #[serde(rename = "createdAt")]
    created_at: String,
    items: Vec<DocketItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AppConfigResponse {
    backend_url: Option<String>,
    main_printer: Option<String>,
    kitchen_printer: Option<String>,
    config_path: Option<String>,
}

const RECEIPT_WIDTH: usize = 40;
const PREFERRED_PRINTER_NAME: &str = "POS80 Printer";
static CACHED_PRINTER_NAME: OnceLock<Mutex<Option<String>>> = OnceLock::new();
static CACHED_APP_CONFIG: OnceLock<Mutex<Option<AppConfigResponse>>> = OnceLock::new();

fn content_width() -> usize {
    RECEIPT_WIDTH.saturating_sub(2)
}

fn normalize_backend_url(url: &str) -> String {
    url.trim().trim_end_matches('/').to_string()
}

fn backend_url_from_value(value: &Value) -> Option<String> {
    let candidate = value
        .get("backendUrl")
        .and_then(Value::as_str)
        .or_else(|| value.get("backend_url").and_then(Value::as_str))
        .or_else(|| value.get("apiBaseUrl").and_then(Value::as_str))
        .or_else(|| value.get("api_base_url").and_then(Value::as_str))
        .or_else(|| value.get("serverUrl").and_then(Value::as_str))
        .or_else(|| value.get("server_url").and_then(Value::as_str))
        .or_else(|| {
            value
                .get("backend")
                .and_then(Value::as_object)
                .and_then(|backend| {
                    backend
                        .get("url")
                        .and_then(Value::as_str)
                        .or_else(|| backend.get("baseUrl").and_then(Value::as_str))
                        .or_else(|| backend.get("base_url").and_then(Value::as_str))
                })
        });

    candidate
        .map(normalize_backend_url)
        .filter(|url| !url.is_empty())
}

fn string_from_value(value: &Value, keys: &[&str]) -> Option<String> {
    for key in keys {
        if let Some(found) = value.get(key).and_then(Value::as_str) {
            let trimmed = found.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }
    None
}

fn printer_name_from_config(value: &Value, printer_type: &str) -> Option<String> {
    let direct_keys = match printer_type {
        "main" => vec!["main_printer", "mainPrinter"],
        "kitchen" => vec!["kitchen_printer", "kitchenPrinter"],
        _ => vec![],
    };

    if let Some(found) = string_from_value(value, &direct_keys) {
        return Some(found);
    }

    value
        .get("printers")
        .and_then(Value::as_object)
        .and_then(|printers| match printer_type {
            "main" => printers
                .get("main")
                .and_then(Value::as_str)
                .or_else(|| printers.get("main_printer").and_then(Value::as_str))
                .or_else(|| printers.get("mainPrinter").and_then(Value::as_str)),
            "kitchen" => printers
                .get("kitchen")
                .and_then(Value::as_str)
                .or_else(|| printers.get("kitchen_printer").and_then(Value::as_str))
                .or_else(|| printers.get("kitchenPrinter").and_then(Value::as_str)),
            _ => None,
        })
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

fn candidate_config_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            paths.push(exe_dir.join("config.json"));
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        let cwd_config = cwd.join("config.json");
        if !paths.iter().any(|path| path == &cwd_config) {
            paths.push(cwd_config);
        }
    }

    paths
}

fn read_app_config() -> Result<AppConfigResponse, String> {
    let candidate_paths = candidate_config_paths();
    let existing_config = candidate_paths
        .iter()
        .find(|path| path.exists())
        .cloned();

    let Some(config_path) = existing_config else {
        return Ok(AppConfigResponse {
            backend_url: None,
            main_printer: None,
            kitchen_printer: None,
            config_path: None,
        });
    };

    let contents = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read {}: {}", config_path.display(), e))?;
    let value: Value = serde_json::from_str(&contents)
        .map_err(|e| format!("Invalid JSON in {}: {}", config_path.display(), e))?;
    let backend_url = backend_url_from_value(&value);
    let main_printer = printer_name_from_config(&value, "main");
    let kitchen_printer = printer_name_from_config(&value, "kitchen");

    Ok(AppConfigResponse {
        backend_url,
        main_printer,
        kitchen_printer,
        config_path: Some(config_path.display().to_string()),
    })
}

#[tauri::command]
fn load_app_config() -> Result<AppConfigResponse, String> {
    let cache = CACHED_APP_CONFIG.get_or_init(|| Mutex::new(None));

    if let Ok(guard) = cache.lock() {
        if let Some(config) = guard.clone() {
            return Ok(config);
        }
    }

    let config = read_app_config()?;

    if let Ok(mut guard) = cache.lock() {
        *guard = Some(config.clone());
    }

    Ok(config)
}

fn center_text(text: &str, width: usize) -> String {
    if text.len() >= width {
        return text.to_string();
    }

    let padding = (width - text.len()) / 2;
    format!("{}{}", " ".repeat(padding), text)
}

fn inset_line(text: &str) -> String {
    format!(" {}{}\n", text, " ".repeat(content_width().saturating_sub(text.len())))
}

fn push_wrapped_lines(buffer: &mut String, text: &str, width: usize) {
    if text.trim().is_empty() {
        return;
    }

    let mut current = String::new();

    for word in text.split_whitespace() {
        if current.is_empty() {
            if word.len() > width {
                buffer.push_str(&format!("{:.width$}\n", word, width = width));
            } else {
                current.push_str(word);
            }
            continue;
        }

        if current.len() + 1 + word.len() <= width {
            current.push(' ');
            current.push_str(word);
        } else {
            buffer.push_str(&current);
            buffer.push('\n');

            if word.len() > width {
                buffer.push_str(&format!("{:.width$}\n", word, width = width));
                current.clear();
            } else {
                current = word.to_string();
            }
        }
    }

    if !current.is_empty() {
        buffer.push_str(&current);
        buffer.push('\n');
    }
}

fn format_key_value(label: &str, value: &str, width: usize) -> String {
    let label = label.trim();
    let value = value.trim();
    let total_len = label.len() + value.len();

    if total_len + 1 >= width {
        format!("{} {}\n", label, value)
    } else {
        let padding = width - total_len;
        format!("{}{}{}\n", label, " ".repeat(padding), value)
    }
}

fn format_amount(value: f64) -> String {
    format!("{:.0}", value)
}
fn push_wrapped_lines_inset(buffer: &mut String, text: &str, width: usize) {
    if text.trim().is_empty() {
        return;
    }

    let mut wrapped = String::new();
    push_wrapped_lines(&mut wrapped, text, width);

    for line in wrapped.lines() {
        buffer.push_str(&inset_line(line));
    }
}

fn escape_powershell_single_quoted(value: &str) -> String {
    value.replace('\'', "''")
}

fn format_receipt(order: &Order) -> String {
    let divider = "-".repeat(RECEIPT_WIDTH);
    let thin_divider = "-".repeat(RECEIPT_WIDTH);
    let inner_width = content_width();
    let mut receipt = String::new();
    let restaurant_info = order.restaurant_info.as_ref();
    let restaurant_name = restaurant_info
        .and_then(|info| info.name.as_deref())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("APOTEK RESTAURANT");
    let address = restaurant_info
        .and_then(|info| info.address.as_deref())
        .filter(|value| !value.trim().is_empty());
    let phone = restaurant_info
        .and_then(|info| info.phone.as_deref())
        .filter(|value| !value.trim().is_empty());
    let email = restaurant_info
        .and_then(|info| info.email.as_deref())
        .filter(|value| !value.trim().is_empty());
    let website = restaurant_info
        .and_then(|info| info.website.as_deref())
        .filter(|value| !value.trim().is_empty());
    let receipt_header = restaurant_info
        .and_then(|info| info.receipt_header.as_deref())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("Thank you for dining with us");
    let receipt_footer = restaurant_info
        .and_then(|info| info.receipt_footer.as_deref())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("We appreciate your visit and look forward to serving you again soon.");
    let receipt_title = order
        .receipt_title
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("RECEIPT");

    receipt.push_str(&center_text(restaurant_name, inner_width));
    receipt.push('\n');
    receipt.push_str(&center_text(receipt_title, inner_width));
    receipt.push('\n');

    if let Some(address) = address {
        push_wrapped_lines_inset(&mut receipt, address, inner_width);
    }
    if let Some(phone) = phone {
        receipt.push_str(&center_text(&format!("Tel: {}", phone), inner_width));
        receipt.push('\n');
    }
    if let Some(email) = email {
        receipt.push_str(&center_text(email, inner_width));
        receipt.push('\n');
    }
    if let Some(website) = website {
        receipt.push_str(&center_text(website, inner_width));
        receipt.push('\n');
    }
    receipt.push_str(&divider);
    receipt.push('\n');

    receipt.push_str(&inset_line(&format_key_value("Receipt", &format!("#{}", order.order_number), inner_width).trim_end()));
    receipt.push_str(&inset_line(&format_key_value("Table", &order.table_number.to_string(), inner_width).trim_end()));
    if let Some(waiter) = &order.waiter {
        receipt.push_str(&inset_line(&format_key_value("Waiter", waiter, inner_width).trim_end()));
    }
    if let Some(customer_name) = &order.customer_name {
        if !customer_name.trim().is_empty() {
            receipt.push_str(&inset_line(&format_key_value("Guest", customer_name, inner_width).trim_end()));
        }
    }

    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&order.created_at) {
        let local = dt.with_timezone(&Local);
        receipt.push_str(&inset_line(&format_key_value(
            "Date",
            &local.format("%Y-%m-%d %H:%M").to_string(),
            inner_width,
        ).trim_end()));
    }
    receipt.push_str(&thin_divider);
    receipt.push('\n');

    receipt.push_str(&format!(" {:<13}{:>5}{:>7}{:>8}\n", "Item", "Qty", "Price", "Total"));
    receipt.push_str(&thin_divider);
    receipt.push('\n');

    for item in &order.order_items {
        let name = &item.menu_item.name;
        let qty = if item.quantity.fract() == 0.0 {
            format!("{}", item.quantity as i32)
        } else {
            format!("{:.2}", item.quantity)
        };
        let item_total = item.quantity * item.price;
        receipt.push_str(&format!(
            " {:<13}{:>5}{:>7}{:>8}\n",
            if name.len() > 13 { format!("{}..", &name[..11]) } else { name.to_string() },
            qty,
            format_amount(item.price),
            format_amount(item_total)
        ));
    }

    receipt.push_str(&thin_divider);
    receipt.push('\n');
    receipt.push_str(&inset_line(&format_key_value("TOTAL", &format_amount(order.total), inner_width).trim_end()));
    receipt.push_str(&divider);
    receipt.push('\n');
    receipt.push_str(&center_text(receipt_header, inner_width));
    receipt.push('\n');
    push_wrapped_lines_inset(&mut receipt, receipt_footer, inner_width);
    receipt.push_str("\n\n\n\n\n");

    receipt
}

fn format_docket(docket: &Docket) -> String {
    let divider = "=".repeat(RECEIPT_WIDTH);
    let thin_divider = "-".repeat(RECEIPT_WIDTH);
    let mut receipt = String::new();

    receipt.push_str(&center_text(&docket.title, RECEIPT_WIDTH));
    receipt.push('\n');
    receipt.push_str(&divider);
    receipt.push('\n');

    receipt.push_str(&format_key_value("Order", &format!("#{}", docket.order_number), RECEIPT_WIDTH));
    receipt.push_str(&format_key_value("Table", &docket.table_number.to_string(), RECEIPT_WIDTH));
    if let Some(waiter) = &docket.waiter {
        receipt.push_str(&format_key_value("Waiter", waiter, RECEIPT_WIDTH));
    }
    if let Some(customer_name) = &docket.customer_name {
        if !customer_name.trim().is_empty() {
            receipt.push_str(&format_key_value("Guest", customer_name, RECEIPT_WIDTH));
        }
    }

    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&docket.created_at) {
        let local = dt.with_timezone(&Local);
        receipt.push_str(&format_key_value(
            "Date",
            &local.format("%Y-%m-%d %H:%M").to_string(),
            RECEIPT_WIDTH,
        ));
    }
    receipt.push_str(&thin_divider);
    receipt.push('\n');

    receipt.push_str(&format!("{:<18}{:>6}{:>18}\n", "Item", "Qty", "Notes"));
    receipt.push_str(&thin_divider);
    receipt.push('\n');

    for item in &docket.items {
        let qty = if item.quantity.fract() == 0.0 {
            format!("{}", item.quantity as i32)
        } else {
            format!("{:.2}", item.quantity)
        };
        receipt.push_str(&format!(
            "{:<18}{:>6}\n",
            if item.name.len() > 18 {
                format!("{}...", &item.name[..15])
            } else {
                item.name.to_string()
            },
            qty
        ));
        if let Some(notes) = &item.notes {
            if !notes.trim().is_empty() {
                receipt.push_str(&format!("  {}\n", notes));
            }
        }
    }

    receipt.push_str(&thin_divider);
    receipt.push('\n');
    receipt.push_str(&divider);
    receipt.push('\n');
    receipt.push_str("\n\n");

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

fn preferred_printer_exists() -> Result<bool, String> {
    let ps_command = format!(
        "$ErrorActionPreference = 'Stop'; $printer = Get-CimInstance Win32_Printer | Where-Object {{ $_.Name -eq '{}' }} | Select-Object -First 1 -ExpandProperty Name; if ($printer) {{ Write-Output 'true' }} else {{ Write-Output 'false' }}",
        PREFERRED_PRINTER_NAME
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &ps_command])
        .output()
        .map_err(|e| format!("Failed to check preferred printer: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().eq_ignore_ascii_case("true"))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to check preferred printer: {}", stderr))
    }
}

fn get_configured_printer(printer_type: &str) -> Option<String> {
    load_app_config()
        .ok()
        .and_then(|config| match printer_type {
            "main" => config.main_printer,
            "kitchen" => config.kitchen_printer,
            _ => None,
        })
        .map(|name| name.trim().to_string())
        .filter(|name| !name.is_empty())
}

fn resolve_fallback_printer_name() -> Result<String, String> {
    let cache = CACHED_PRINTER_NAME.get_or_init(|| Mutex::new(None));
    if let Ok(guard) = cache.lock() {
        if let Some(cached_name) = guard.clone() {
            return Ok(cached_name);
        }
    }

    let resolved_name = if preferred_printer_exists()? {
        PREFERRED_PRINTER_NAME.to_string()
    } else {
        get_default_printer()?
    };

    if let Ok(mut guard) = cache.lock() {
        *guard = Some(resolved_name.clone());
    }

    Ok(resolved_name)
}

fn resolve_printer_name(printer_name: Option<String>, configured_printer: Option<String>) -> Result<String, String> {
    if let Some(name) = printer_name.filter(|n| !n.trim().is_empty()) {
        return Ok(name);
    }

    if let Some(configured_name) = configured_printer {
        return Ok(configured_name);
    }

    resolve_fallback_printer_name()
}

fn resolve_receipt_printer_name(printer_name: Option<String>) -> Result<String, String> {
    resolve_printer_name(printer_name, get_configured_printer("main"))
}

fn resolve_docket_printer_name(docket: &Docket, printer_name: Option<String>) -> Result<String, String> {
    let configured_printer = if docket.title.trim().to_uppercase().contains("BAR")
        || docket.title.trim().to_uppercase().contains("DRINK")
    {
        get_configured_printer("main")
    } else {
        get_configured_printer("kitchen")
            .or_else(|| get_configured_printer("main"))
    };

    resolve_printer_name(printer_name, configured_printer)
}

fn print_text_rendered(text: &str, printer_name: Option<String>, font_size: i32, label: &str) -> Result<String, String> {
    if text.is_empty() {
        return Err(format!("Failed to format {}", label));
    }

    let printer = resolve_printer_name(printer_name, None)?;
    let escaped_printer = escape_powershell_single_quoted(&printer);
    let escaped_text = escape_powershell_single_quoted(text);

    let ps_command = format!(
        "$ErrorActionPreference = 'Stop'; \
         Add-Type -AssemblyName 'System.Drawing'; \
         $doc = New-Object System.Drawing.Printing.PrintDocument; \
         $doc.PrinterSettings.PrinterName = '{}'; \
         $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0); \
         $text = '{}'; \
         $script = {{ \
             param($sender, $ev); \
             $font = New-Object System.Drawing.Font('Consolas', {}); \
             $brush = [System.Drawing.Brushes]::Black; \
             $lineHeight = $font.GetHeight($ev.Graphics); \
             $y = 0; \
             foreach ($line in ($text -split \"`r?`n\")) {{ \
                 $ev.Graphics.DrawString($line, $font, $brush, 0, $y); \
                 $y += $lineHeight; \
             }} \
         }}; \
         $doc.add_PrintPage($script); \
         $doc.Print()",
        escaped_printer,
        escaped_text,
        font_size
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &ps_command])
        .output()
        .map_err(|e| format!("Failed to execute rendered {} print command: {}", label, e))?;

    if output.status.success() {
        Ok(format!(
            "{} printed successfully to: {}",
            label.to_uppercase(),
            printer
        ))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!(
            "{} printing failed: {}. Tip: Ensure the printer driver is installed correctly.",
            label,
            stderr
        ))
    }
}

/// Silent print to Windows printer using .NET PrintDocument
/// This is the most reliable method as it allows explicit control over margins and fonts
#[tauri::command]
fn print_receipt_silent(
    order: Order,
    printer_name: Option<String>,
) -> Result<String, String> {
    let receipt_text = format_receipt(&order);
    let resolved_printer = resolve_receipt_printer_name(printer_name)?;
    print_text_rendered(&receipt_text, Some(resolved_printer), 9, "receipt")
}

/// Alternative method: Direct printing via Out-Printer cmdlet
#[tauri::command]
fn print_receipt_direct(
    order: Order,
    printer_name: Option<String>,
) -> Result<String, String> {
    let receipt_text = format_receipt(&order);
    let resolved_printer = resolve_receipt_printer_name(printer_name)?;
    print_text_rendered(&receipt_text, Some(resolved_printer), 9, "receipt")
}

/// Silent print docket to Windows printer using .NET PrintDocument
#[tauri::command]
fn print_docket_silent(
    docket: Docket,
    printer_name: Option<String>,
) -> Result<String, String> {
    let docket_text = format_docket(&docket);
    let resolved_printer = resolve_docket_printer_name(&docket, printer_name)?;
    print_text_rendered(&docket_text, Some(resolved_printer), 9, "docket")
}

/// Alternative method: Direct docket printing via Out-Printer cmdlet
#[tauri::command]
fn print_docket_direct(
    docket: Docket,
    printer_name: Option<String>,
) -> Result<String, String> {
    let docket_text = format_docket(&docket);
    let resolved_printer = resolve_docket_printer_name(&docket, printer_name)?;
    print_text_rendered(&docket_text, Some(resolved_printer), 9, "docket")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
        tauri::Builder::default()
            .invoke_handler(tauri::generate_handler![
                load_app_config,
                print_receipt_silent,
                print_receipt_direct,
                get_default_printer,
                print_docket_silent,
                print_docket_direct
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
