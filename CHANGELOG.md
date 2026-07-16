# Changelog

All notable changes to Manan Wealth OS. Newest first.

## 2026-07-16

### Fixed — correctness (Phases 1–3 audit)
- **PIN lock now actually locks on cold start.** Unlock state moved from
  SecureStore (which persists across restarts — the PIN was asked once, ever)
  to in-memory.
- **Notification deep link wired up.** The daily reminder carried a target
  screen in its payload but nothing listened; taps now open Add Expense (cold
  start and warm), routed through the PIN lock, never around it.
- **Stale-screen fix.** All data hooks refetch on screen focus — expo-router
  keeps tab screens mounted, so totals/lists went stale after modals wrote to
  SQLite.
- **Local dates.** All `toISOString()` calendar math replaced with local-time
  helpers; before 5:30 AM IST, expenses logged "today" landed on yesterday.
- **Quick add no longer creates phantom rows.** Chips now open the add modal
  with the category pre-selected instead of inserting a ₹0 expense that
  survived cancellation.
- **Salary is one entry per month.** Re-logging a month updates in place and
  skips the emergency-fund top-up so corrections can't double the transfer.
- **WAL-safe backups.** Export checkpoints the WAL first (recent writes lived
  in the `-wal` sidecar and could be missing from backups); restore deletes
  stale sidecars so an old WAL isn't replayed over restored data.
- **Restore validation.** Both restore paths check the SQLite magic bytes
  before overwriting the live DB; the picker no longer filters by MIME type
  (Android reports `.db` as octet-stream, making backups unpickable).
- **CSV BOM.** Excel now renders ₹ and Unicode notes correctly.

### Added
- Investments: tap a holding to edit it; per-holding returns; empty state.
- Delete confirmations on every destructive action (expenses, goals,
  holdings, SIPs, recurring templates, salary entries).
- Daily reminder on/off toggle in Settings (`reminderEnabled` existed in the
  schema but was never honored); bootstrap re-arms the schedule.
- Salary history rows can be deleted.
- Animations: spring-fill progress bars, PIN-error shake.

### Changed
- Removed `expo-secure-store` (unused after the lock rewrite).
- Expo packages bumped to latest SDK 57 patches (expo-doctor 20/20).

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
