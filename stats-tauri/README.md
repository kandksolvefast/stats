# Stats Tauri

Tauri + React + TypeScript scaffold for the Stats migration. Uses Vite, Tailwind tokens from `docs/design-system.md`, Zustand stores, and Recharts charts.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build
- `npm run lint` — ESLint (TS/React/Tailwind)
- `npm run check` — TypeScript `--noEmit`
- `npm run tauri` — run Tauri dev once tooling is installed

## Next Steps
- Wire Tauri commands to CPU reader and emit events
- Implement module stores/hooks and widgets per `docs/modules/cpu.md`
- Add CI to run lint/tests when dependencies are available
