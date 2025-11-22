// Minimal Tauri entrypoint; commands will be expanded during Phase 1.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod readers;
mod utils;

use commands::*;

fn main() {
  tauri::Builder::default()
    .manage(AppState::default())
    .invoke_handler(tauri::generate_handler![get_cpu_stats, start_monitoring, stop_monitoring])
    .setup(|app| {
      let _handle = app.handle();
      // TODO: spawn background monitoring coordinator when implemented
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
