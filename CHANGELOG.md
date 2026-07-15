# Changelog

All notable changes to Manan Wealth OS. Newest first.

## 2026-07-15

### Fixed — build baseline
- Aligned all `react-native-*` package versions to Expo SDK 57 via `expo install --fix`
  (gesture-handler, reanimated, safe-area-context, screens, svg, worklets).
- Removed invalid `newArchEnabled` key from `app.json` — `expo-doctor` now passes 20/20.
- Added `mobile/.npmrc` with `legacy-peer-deps=true`: Expo SDK 57 pins `react@19.2.3`
  while transitive `react-dom@19.2.7` (via expo-router's radix deps) peer-requires a
  newer patch; the tree is fine at runtime.

### Added — tooling
- ESLint via `eslint-config-expo` + `npm run lint` script.
- Root `TASK.md` (working checklist) and `CHANGELOG.md` (this file).

### Fixed — lint
- All 14 `react/no-unescaped-entities` errors replaced with typographic quotes
  (settings, salary, recurring, onboarding, goals screens).
- Removed unused `Text` import in `WeeklySpendChart`.

## Earlier (initial commits)

- Phase 1–3 feature drop: onboarding wizard, PIN lock, dashboard, expense tracker with
  quick-add and daily reminder, investments + SIP tracker, goals, salary tracker,
  recurring expenses auto-logging, salary-day automation, net worth timeline, analytics,
  monthly PDF/CSV reports, plain and AES-encrypted backups. All on-device
  (Expo + SQLite/Drizzle + Zustand), no network calls.
