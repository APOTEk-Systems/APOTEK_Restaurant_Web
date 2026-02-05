use tauri::command;
use std::fs::File;
use std::io::Write;

#[command]
fn print_html_80mm(printer_name: String, html_content: String) -> Result<String, String> {
    // Create temp HTML file with correct page size
    let html = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: 58mm 297mm;
            margin: 0;
        }}
        body {{
            margin: 0;
            padding: 5mm;
            width: 48mm;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }}
        @media print {{
            body {{
                width: 48mm;
            }}
        }}
    </style>
</head>
<body>
{}
</body>
</html>
    "#, html_content);
    
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("print_receipt.html");
    
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    file.write_all(html.as_bytes())
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    // Print using system commands
    #[cfg(target_os = "windows")]
    {
        // Use default browser to print
        std::process::Command::new("cmd")
            .args(["/C", "start", "", file_path.to_str().unwrap()])
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        // Use wkhtmltopdf if available
        let pdf_path = temp_dir.join("print_receipt.pdf");
        let output = std::process::Command::new("wkhtmltopdf")
            .args([
                "--page-width", "80mm",
                "--page-height", "297mm",
                "--margin-top", "0",
                "--margin-bottom", "0",
                "--margin-left", "0",
                "--margin-right", "0",
                file_path.to_str().unwrap(),
                pdf_path.to_str().unwrap()
            ])
            .output()
            .map_err(|e| format!("wkhtmltopdf failed: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("PDF creation failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        // Print the PDF
        std::process::Command::new("lp")
            .args(["-d", &printer_name, pdf_path.to_str().unwrap()])
            .spawn()
            .map_err(|e| format!("Print failed: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(file_path.to_str().unwrap())
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    Ok("Print initiated".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_html_80mm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}