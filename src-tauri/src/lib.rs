use tauri_plugin_printer_v2::init;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}