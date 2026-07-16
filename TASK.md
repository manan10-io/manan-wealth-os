# TASK.md — Manan Wealth OS

Working checklist. Updated every iteration. See `CHANGELOG.md` for what shipped and
`ARCHITECTURE.md` for how it fits together.

## Phase 1 — Foundation ✅

- [x] Project builds successfully (`npm install`, `npx expo-doctor` 20/20, `npm run lint` 0 errors, `npx tsc --noEmit` clean, `npx expo export --platform android` bundles)
- [x] ESLint set up (`eslint-config-expo`, `npm run lint`)
- [x] Dependency versions aligned to Expo SDK 57 (`expo install --fix`)
- [x] Navigation audit — guards (onboarding → pin-lock → tabs), notification deep link, back behavior
- [x] SQLite initialization audit — idempotent bootstrap, WAL, forward patches
- [x] Persistence audit — profile in SQLite; PIN unlock is in-memory so cold starts always lock
- [x] Onboarding flow audit — all 7 steps, validation, seeded investments/SIPs

## Phase 2 — Core modules ✅

- [x] Dashboard — today/month spend, salary, savings %, net worth, SIP total, emergency fund, charts
- [x] Expense CRUD — add/edit/delete (with confirm), quick add pre-selects category, daily sections
- [x] Salary tracker — one entry per month (upsert), history with delete, auto-split card
- [x] Investment tracker — holdings CRUD incl. tap-to-edit, invested vs current vs returns per holding
- [x] SIP tracker — CRUD + future-value projection (monthly-compounding annuity)
- [x] Goals — CRUD with confirm, progress, quick contributions

## Phase 3 — Engines & IO ✅

- [x] Net worth engine — monthly snapshots synced on app open / salary log, timeline chart
- [x] Analytics charts — income vs expense, 7-day trend, category breakdown, net worth timeline
- [x] Notifications — daily reminder with on/off toggle, re-armed on bootstrap, tap deep-links to add-expense without bypassing PIN
- [x] Reports export — monthly PDF summary + UTF-8-BOM CSV expense log
- [x] Backup & restore — WAL-checkpointed `.db` export, SQLite-magic-validated restore, AES-encrypted `.mwobackup` with password validation

## Phase 4 — Production polish ✅

- [x] UI polish pass (Apple-inspired premium dark UI — ink/indigo token system, Sora + Inter)
- [x] Dark mode — the app is dark-first by design (`userInterfaceStyle: "dark"`), consistent across all screens
- [x] Animations — spring-animated progress bars, PIN-error shake
- [x] Performance — SectionList virtualization for expenses, memoized derived totals, focus-scoped refetch
- [x] Production readiness — empty states on all lists, delete confirmations, error alerts on IO, clean lint/tsc/doctor/bundle

## Verification loop (every iteration)

```
npm install
npx expo-doctor
npm run lint
npx tsc --noEmit
```

Commit only when all four are green. Final state: all green, production Android
bundle exports cleanly (5.7 MB Hermes bytecode).

## Backlog (nice-to-haves, not blocking)

- [ ] Liabilities tracking feeding true net worth (currently assets-only)
- [ ] Native `.xlsx` export (deliberately CSV today — see ARCHITECTURE.md)
- [ ] Savings-rate trend chart once multi-month data accumulates
- [ ] On-device visual QA pass (needs a physical phone/emulator)
