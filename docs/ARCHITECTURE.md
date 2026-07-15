# Architecture

## Why no backend, why on-device SQLite

The spec asked for FastAPI + SQLite. On a phone there's nowhere for FastAPI to run
persistently, so for the mobile app the backend is dropped entirely: `expo-sqlite`
opens a database file directly inside the app, and `drizzle-orm` provides typed
queries against it. No HTTP, no server process, no network permission needed at all.
This is a strictly stronger privacy guarantee than "backend running on localhost"
would have been — there is no localhost, and no listening port, ever.

## Data model

Defined in `mobile/database/schema.ts`, bootstrapped with idempotent
`CREATE TABLE IF NOT EXISTS` statements in `mobile/database/client.ts` (no separate
migration-runner step needed for Phase 1 — see that file's comment for how to extend
it once the schema needs to change under existing users' data).

| Table                | Purpose                                              |
|-----------------------|-------------------------------------------------------|
| `profile`             | one row — onboarding answers, PIN hash, reminder time |
| `expenses`             | the daily log                                        |
| `recurring_expenses`   | templates for Phase 2 auto-logging (rent, Netflix…)  |
| `salary_entries`       | one row per month                                    |
| `investments`          | holdings — MF, stock, gold, FD, cash, emergency fund |
| `sips`                 | monthly SIP amount, start date, expected return %    |
| `goals`                | target/current amount, target date                   |
| `net_worth_snapshots`  | reserved for the Phase 3 net worth timeline chart    |

## State management

- **Zustand** (`store/useAppStore.ts`) holds the one piece of truly global state:
  the profile row, onboarding/lock status. This is what routing guards read.
- Everything else — expenses, investments, SIPs, goals, salary — is a plain data
  hook (`hooks/use*.ts`) that queries SQLite directly and exposes CRUD functions
  plus derived totals. There's no separate cache layer; SQLite reads are fast enough
  on-device that refetch-after-mutation is simpler and just as fast as a cache would
  be for this data volume.
- **React Hook Form** drives the expense add/edit form.

## Navigation

`expo-router`, file-based, under `mobile/app/`:

```
app/
  index.tsx                    redirect logic (onboarding -> pin-lock -> tabs)
  onboarding/index.tsx         the wizard
  pin-lock.tsx                 unlock screen
  expenses/add.tsx             add-expense modal (also the notification deep link)
  expenses/[id].tsx            edit/delete-expense modal
  (app)/
    _layout.tsx                unlock guard
    (tabs)/
      dashboard.tsx  expenses.tsx  investments.tsx  goals.tsx  settings.tsx
    salary/index.tsx           pushed from a Dashboard/Settings link, not a tab
    analytics/index.tsx        pushed from a Dashboard/Settings link, not a tab
    recurring/index.tsx        pushed from a Settings link, not a tab
    reports/index.tsx          pushed from a Settings link, not a tab
```

Salary, Analytics, Recurring, and Reports are reachable screens rather than tabs —
five tabs (Dashboard/Expenses/Invest/Goals/Settings) keeps the bottom bar usable; a
9-tab bar would cramp on a real phone width.

## Design system

Dark, "premium/Apple-inspired" per the brief. Token choices (in
`mobile/tailwind.config.js`):
- **Ink** background (`#0B0D12`, not pure black) with two lighter surface levels for
  card layering.
- **Indigo accent** (`#5B6CFF`) — deliberately not the terracotta/violet that's the
  generic AI-generated default, and distinct from a plain black+green fintech look.
- **Semantic gain/loss colors** (green/red) used functionally for money, not
  decoratively elsewhere.
- **Sora** for numbers and headings (a little more geometric warmth than a pure
  grotesk), **Inter** for body/UI text (built for small-size legibility, which
  matters when every screen is full of numbers).

## Why CSV instead of native .xlsx export

The `xlsx` (SheetJS) package on the public npm registry carries known high-severity
vulnerabilities (prototype pollution, ReDoS) — SheetJS only ships the patched builds
through their own CDN, which this build environment couldn't reach. Rather than ship
a known-vulnerable dependency in a finance app, expense export uses CSV instead:
Excel, Sheets, and Numbers all open CSV natively, so functionally little is lost. If
you want true multi-sheet `.xlsx` later, either vendor SheetJS's CDN build directly
into `mobile/`, or swap in an alternative like `exceljs`.

## Verification performed in this sandbox

- `npx tsc --noEmit` — clean, zero errors, across the full app, re-verified after
  every phase (Phase 1, then again after Phase 2/3 additions).
- `npx expo export --platform android` — a full production Metro bundle, run twice:
  2,244 modules after Phase 1, 2,291 modules after Phase 2/3, both completed with
  zero bundler errors. This is the strongest check possible without a physical
  device or emulator attached to this environment; it confirms every import
  resolves, every screen's JSX compiles, and the dependency graph (Reanimated,
  NativeWind, Drizzle, gifted-charts, notifications, SQLite, expo-print,
  crypto-js) links correctly together.
- `npm audit` — checked after adding new dependencies; the vulnerable `xlsx`
  package was caught this way and removed before delivery (see above).
- What could **not** be verified here: on-device rendering/visual QA, notification
  firing at the scheduled time, the SQLite file actually persisting across app
  restarts, and the PDF/CSV share sheets behaving correctly on a real phone. Please
  flag anything that looks off once you run it — I'll fix it immediately.
