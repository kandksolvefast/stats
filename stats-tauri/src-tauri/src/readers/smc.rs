//! Minimal SMC temperature reader for macOS.
//! Uses the `smc` crate to fetch CPU temperatures from common keys.

#[cfg(target_os = "macos")]
use smc::SMC;

#[cfg(target_os = "macos")]
// Common CPU temperature keys (package and core) used by macOS.
const CPU_TEMP_KEYS: [&str; 8] = ["TC0P", "TC0E", "TC0F", "TC0H", "TC1P", "TC2P", "TC3P", "TCXC"];

#[cfg(target_os = "macos")]
pub fn read_cpu_temperature() -> Option<f32> {
    let smc = SMC::new().ok()?;
    let temps: Vec<f32> = CPU_TEMP_KEYS
        .iter()
        .filter_map(|key| smc.temperature((*key).into()).ok())
        .filter(|t| *t > 0.0 && *t < 120.0)
        .map(|t| t as f32)
        .collect();
    if temps.is_empty() {
        None
    } else {
        let sum: f32 = temps.iter().sum();
        Some(sum / temps.len() as f32)
    }
}

#[cfg(not(target_os = "macos"))]
pub fn read_cpu_temperature() -> Option<f32> {
    None
}
