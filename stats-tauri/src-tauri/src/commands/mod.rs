use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Duration;
use tauri::State;
use tauri::Manager;

use crate::readers::cpu::{CpuReader, CpuSnapshot};

pub struct AppState {
  // Placeholder shared state container
  pub cpu_reader: Mutex<CpuReader>,
  pub monitors: Mutex<HashMap<String, tauri::async_runtime::JoinHandle<()>>>,
}

#[tauri::command]
pub fn get_cpu_stats(state: State<'_, AppState>) -> CpuSnapshot {
  let mut guard = state
    .cpu_reader
    .lock()
    .expect("failed to lock cpu reader");
  let snapshot = guard.snapshot();
  snapshot
}

#[tauri::command]
pub fn start_monitoring(
  app_handle: tauri::AppHandle,
  state: State<'_, AppState>,
  module: String,
  interval: u64,
) -> Result<(), String> {
  let mut monitors = state
    .monitors
    .lock()
    .map_err(|_| "failed to lock monitors")?;

  // Stop any existing monitor for this module
  if let Some(handle) = monitors.remove(&module) {
    handle.abort();
  }

  if module != "cpu" {
    // Other modules will be added later
    return Ok(());
  }

  let mut reader = CpuReader::new();
  let tick_ms = interval.clamp(500, 60_000); // enforce sane bounds
  let handle = tauri::async_runtime::spawn(async move {
    let mut ticker = tokio::time::interval(Duration::from_millis(tick_ms));
    loop {
      ticker.tick().await;
      let snapshot = reader.snapshot();
      let _ = app_handle.emit_all("cpu_update", &snapshot);
    }
  });

  monitors.insert(module, handle);
  Ok(())
}

#[tauri::command]
pub fn stop_monitoring(state: State<'_, AppState>, module: String) -> Result<(), String> {
  let mut monitors = state
    .monitors
    .lock()
    .map_err(|_| "failed to lock monitors")?;

  if let Some(handle) = monitors.remove(&module) {
    handle.abort();
  }

  Ok(())
}

impl Default for AppState {
  fn default() -> Self {
    AppState {
      cpu_reader: Mutex::new(CpuReader::new()),
      monitors: Mutex::new(HashMap::new()),
    }
  }
}
