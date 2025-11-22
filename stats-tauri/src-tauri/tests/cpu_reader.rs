use stats_tauri::readers::cpu::CpuReader;

#[test]
fn snapshot_has_expected_fields() {
    let mut reader = CpuReader::new();
    let snapshot = reader.snapshot();

    assert!(snapshot.total_usage >= 0.0);
    assert_eq!(snapshot.per_core_usage.len(), snapshot.logical_cores);
    assert!(snapshot.logical_cores >= snapshot.physical_cores);
    assert!(snapshot.idle_load <= 100.0);
    assert!(snapshot.timestamp.timestamp_millis() > 0);
    assert!(snapshot.top_processes.len() <= 10);
}
