
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::command;
use printer;

#[command]
fn print_raw_silent(printer_name: String, content: String) -> Result<String, String> {
    // 1. Get the list of system printers
    let printers = printer::get_printers();
    
    // 2. Find the one matching your name
    let target_printer = printers.iter()
        .find(|p| p.name == printer_name)
        .ok_or_else(|| format!("Printer '{}' not found", printer_name))?;

    // 3. Send the raw bytes
    // We convert the string to bytes for the printer
    match printer::print(target_printer, content.as_bytes()) {
        Ok(_) => Ok("Print job sent successfully".into()),
        Err(e) => Err(format!("Failed to print: {}", e)),
    }
}

// Ensure you register the command in your builder
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_raw_silent])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}