use chrono::{DateTime, Utc};
use serde::Serialize;
use sysinfo::{CpuRefreshKind, ProcessRefreshKind, RefreshKind, System};

#[derive(Clone, Debug, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
  pub pid: u32,
  pub name: String,
  pub cpu_usage: f32,
  pub memory_usage: u64,
}

#[derive(Clone, Debug, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CpuSnapshot {
  /// Total CPU utilization across all cores (0.0 - 100.0)
  pub total_usage: f32,
  /// Per-core CPU utilization (0.0 - 100.0 each)
  pub per_core_usage: Vec<f32>,
  /// System (kernel) load percentage (if available)
  pub system_load: Option<f32>,
  /// User (application) load percentage (if available)
  pub user_load: Option<f32>,
  /// Idle percentage
  pub idle_load: f32,
  /// CPU temperature in Celsius (if available)
  pub temperature: Option<f32>,
  /// Current CPU frequency in MHz (if available)
  pub frequency: Option<u64>,
  /// Number of physical cores
  pub physical_cores: usize,
  /// Number of logical cores (including hyperthreading)
  pub logical_cores: usize,
  /// Top processes by CPU usage
  pub top_processes: Vec<ProcessInfo>,
  /// Timestamp of measurement
  pub timestamp: DateTime<Utc>,
}

pub struct CpuReader {
  system: System,
}

impl CpuReader {
  pub fn new() -> Self {
    let refresh = RefreshKind::new()
      .with_cpu(CpuRefreshKind::everything())
      .with_processes(ProcessRefreshKind::new().with_cpu().with_memory());

    let mut system = System::new_with_specifics(refresh);
    system.refresh_cpu_specifics(CpuRefreshKind::everything());
    system.refresh_processes_specifics(ProcessRefreshKind::new().with_cpu().with_memory());
    Self { system }
  }

  pub fn snapshot(&mut self) -> CpuSnapshot {
    self
      .system
      .refresh_cpu_specifics(CpuRefreshKind::everything());

    // Refresh process CPU data for top processes view
    self
      .system
      .refresh_processes_specifics(ProcessRefreshKind::new().with_cpu().with_memory());

    let cpu_info = self.system.global_cpu_info();
    let usage = cpu_info.cpu_usage();
    let frequency = Some(cpu_info.frequency());

    let per_core_usage = self
      .system
      .cpus()
      .iter()
      .map(|cpu| cpu.cpu_usage())
      .collect::<Vec<_>>();

    let logical_cores = self.system.cpus().len();
    let physical_cores = self.system.physical_core_count().unwrap_or(logical_cores);

    let top_processes = Self::collect_top_processes(&self.system);
    let idle_load = (100.0 - usage).max(0.0);

    CpuSnapshot {
      total_usage: usage,
      per_core_usage,
      system_load: None, // sysinfo doesn't currently expose user/system split
      user_load: None,
      idle_load,
      temperature: None,
      frequency,
      physical_cores,
      logical_cores,
      top_processes,
      timestamp: Utc::now(),
    }
  }

  fn collect_top_processes(system: &System) -> Vec<ProcessInfo> {
    let mut processes: Vec<ProcessInfo> = system
      .processes()
      .values()
      .map(|p| ProcessInfo {
        pid: p.pid().as_u32(),
        name: p.name().to_string(),
        cpu_usage: p.cpu_usage(),
        memory_usage: p.memory(),
      })
      .collect();

    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
    processes.truncate(10);
    processes
  }
}

impl Clone for CpuReader {
  fn clone(&self) -> Self {
    CpuReader::new()
  }
}

impl Default for CpuReader {
  fn default() -> Self {
    CpuReader::new()
  }
}
