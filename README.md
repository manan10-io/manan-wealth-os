# Manan Wealth OS

Your private, offline finance operating system. Everything runs on-device — there is
no server, no account, and no network call anywhere in this codebase.

## What's in this drop

**Phase 1**
- **Onboarding wizard** — joining date, expected salary, savings goal %, emergency
  fund goal, existing investments, active SIPs, and a 4-digit PIN, in one flow.
- **PIN lock** — app-level lock backed by a hashed PIN (never stored in plain text).
- **Dashboard** — today's spend, month's spend, salary, savings %, net worth,
  investments, monthly SIP total, emergency fund progress, a 7-day spend chart, and
  a category breakdown donut chart.
- **Expense tracker** — the daily driver. Quick-add buttons (Food / Fuel / Shopping /
  Bills / Travel / Others), a full add/edit form, notes, payment method, delete, and
  automatic daily/monthly/category totals.
- **Daily 9 PM reminder** — a local notification ("Manan, what expenses did you have
  today?") that deep-links straight into the add-expense screen. Fully offline.
- **Investments tab** — add/track mutual funds, stocks, gold, FDs, cash, emergency
  fund; invested vs. current value vs. returns.
- **SIP tracker** — inside the Investments tab. Future value projection using the
  standard monthly-compounding annuity formula, against an optional goal amount.
- **Goals** — target amount, current amount, target date, progress bar, quick
  "+₹1,000 / +₹5,000" contribution buttons.
- **Salary tracker** — log gross/in-hand/PF/tax/bonus per month, with history.
- **Analytics** — income vs. expense, 7-day trend, category breakdown.

**Phase 2**
- **Recurring expenses** — set up templates (rent, Netflix, gym, internet) with an
  amount and a day of month; the app auto-logs each one exactly once per month,
  with no action from you.
- **Salary-day automation** — configurable Savings / SIP / Emergency Fund split
  percentages (Settings). Every time you log a salary entry, the Emergency Fund
  investment is topped up automatically by its share — the one part of the split
  the app can actually move for you (SIPs are separate bank debits, and "savings"
  is already what's left over, so those two are shown as your target, not moved).

**Phase 3**
- **Net worth timeline** — one snapshot per month, computed automatically every
  time you open the app, charted as a growth line on the Analytics screen.
- **Monthly closing reports** — a generated PDF (expense / savings / investment /
  net worth summary) and a full expense-log CSV, both shared straight from the
  Settings → Monthly reports screen through the OS share sheet.
- **Encrypted backups** — alongside the plain `.db` export, Settings now offers a
  password-protected backup: the database is AES-encrypted on-device before it's
  written out. There's no password recovery by design — nothing to reset it from.

Everything is backed by one on-device SQLite file, via Drizzle ORM.

## What's left, if you want it

- Liabilities tracking (loans, credit card dues) feeding into a true net-worth
  figure, rather than assets-only
- Multi-sheet native `.xlsx` export (today's export is CSV — see
  `docs/ARCHITECTURE.md` for why `.xlsx` was deliberately dropped)
- Push-based (rather than open-app-triggered) net worth snapshotting
- Charts for savings-rate trend and investment growth specifically, beyond what
  Analytics already shows

Say the word and I'll build any of these next.

## Run it on your Android phone tonight (no build step)

1. Install **Expo Go** from the Play Store on your phone.
2. On your computer: `cd mobile && npm install`
3. `npx expo start`
4. Scan the QR code with the Expo Go app (phone and computer must be on the same
   Wi-Fi network).

That's it — the app opens live on your phone. Every code change you (or I) make
shows up instantly.

Full details, including how to get a real standalone `.apk` you can install without
Expo Go, are in [`docs/RUNNING_ON_ANDROID.md`](docs/RUNNING_ON_ANDROID.md).

## Project structure

```
manan-wealth-os/
  mobile/          the app — React Native + Expo + TypeScript
    app/           expo-router screens (file-based routing)
    components/    reusable UI (ui/, dashboard/, expenses/)
    database/      Drizzle schema + SQLite client
    hooks/         data hooks (useExpenses, useInvestments, useSips, useGoals, useSalary)
    services/      pin, notifications, formatting, backup
    store/         zustand app store (profile, onboarding, lock state)
  backend/         intentionally empty — see backend/README.md for why
  docs/            architecture notes + Android run guide
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the reasoning behind the
FastAPI-drop decision and the full data model.
