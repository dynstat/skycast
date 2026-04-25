# SkyCast Desktop

SkyCast is a Tauri desktop weather dashboard built with React, Vite, and Open-Meteo's no-key public APIs.

## Features

- City search with geocoding
- Current conditions, hourly forecast, and 10-day outlook
- Temperature, rain chance, and wind trend charts
- Air quality snapshot
- Live app CPU and RAM usage powered by Rust and refreshed every 2 seconds
- Metric/imperial unit toggle
- Favorite locations with local persistence
- Current-location lookup through the desktop webview
- Animated dashboard UI with responsive desktop layouts
- Windows release executable runs without opening a separate console window

## Run

```powershell
npm install
npm run tauri dev
```

For a frontend-only browser preview:

```powershell
npm run dev
```

## Build

Build a production desktop app and Windows installer:

```powershell
npm run tauri build
```

This project is configured to generate an `NSIS` installer on Windows.

Primary outputs:

- Desktop executable: `src-tauri\target\release\skycast.exe`
- Windows installer: `src-tauri\target\release\bundle\nsis\SkyCast_0.1.0_x64-setup.exe`

## Notes

- Weather data comes from Open-Meteo forecast, geocoding, and air-quality APIs.
- The app resource monitor uses Rust via a Tauri command and `sysinfo`.
- The installer package is smaller for distribution, but installed size is still based on the actual app binary and assets.
