#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    process,
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};

use sysinfo::{Pid, ProcessesToUpdate, System};

struct UsageState {
    system: Mutex<System>,
    pid: Pid,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppUsage {
    cpu_percent: f32,
    memory_bytes: u64,
    virtual_memory_bytes: u64,
    pid: u32,
    timestamp_ms: u64,
}

impl UsageState {
    fn new() -> Self {
        let pid = Pid::from_u32(process::id());
        let mut system = System::new_all();
        let target = [pid];
        system.refresh_processes(ProcessesToUpdate::Some(&target), true);

        Self {
            system: Mutex::new(system),
            pid,
        }
    }
}

#[tauri::command]
fn get_app_usage(state: tauri::State<'_, UsageState>) -> Result<AppUsage, String> {
    let mut system = state
        .system
        .lock()
        .map_err(|_| "Unable to read app usage state".to_string())?;
    let target = [state.pid];

    system.refresh_processes(ProcessesToUpdate::Some(&target), true);

    let process = system
        .process(state.pid)
        .ok_or_else(|| "Unable to find the SkyCast process".to_string())?;
    let timestamp_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_millis() as u64;

    Ok(AppUsage {
        cpu_percent: process.cpu_usage(),
        memory_bytes: process.memory(),
        virtual_memory_bytes: process.virtual_memory(),
        pid: state.pid.as_u32(),
        timestamp_ms,
    })
}

fn main() {
    tauri::Builder::default()
        .manage(UsageState::new())
        .invoke_handler(tauri::generate_handler![get_app_usage])
        .run(tauri::generate_context!())
        .expect("error while running SkyCast");
}
