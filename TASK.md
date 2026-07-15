# TASK.md — Manan Wealth OS

Working checklist. Updated every iteration. See `CHANGELOG.md` for what shipped and
`ARCHITECTURE.md` for how it fits together.

## Phase 1 — Foundation

- [x] Project builds successfully (`npm install`, `npx expo-doctor` 20/20, `npm run lint` 0 errors, `npx tsc --noEmit` clean, `npx expo export --platform android` bundles)
- [x] ESLint set up (`eslint-config-expo`, `npm run lint`)
- [x] Dependency versions aligned to Expo SDK 57 (`expo install --fix`)
- [ ] Navigation audit — guards (onboarding → pin-lock → tabs), deep links, back behavior
- [ ] SQLite initialization audit — idempotent bootstrap, WAL, forward patches
- [ ] Zustand persistence audit — profile/lock state survive restart
- [ ] Onboarding flow audit — all 7 steps, validation, seeded investments/SIPs

## Phase 2 — Core modules

- [ ] Dashboard — today/month spend, salary, savings %, net worth, SIP total, emergency fund, charts
- [ ] Expense CRUD — add/edit/delete, quick add, categories, payment method, daily sections
- [ ] Salary tracker — log per month, history, auto-split card
- [ ] Investment tracker — holdings CRUD, invested vs current vs returns
- [ ] SIP tracker — CRUD + future-value projection
- [ ] Goals — CRUD, progress, quick contributions

## Phase 3 — Engines & IO

- [ ] Net worth engine — monthly snapshots, timeline chart
- [ ] Analytics charts — income vs expense, 7-day trend, category breakdown
- [ ] Notifications — daily reminder, deep link into add-expense
- [ ] Reports export — monthly PDF summary + CSV expense log
- [ ] Backup & restore — plain `.db` and AES-encrypted `.mwobackup`

## Phase 4 — Production polish

- [ ] UI polish pass (Apple-inspired premium dark UI)
- [ ] Dark mode consistency
- [ ] Animations (transitions, micro-interactions)
- [ ] Performance (list virtualization, memoization where measured)
- [ ] Production readiness (error states, empty states, audit)

## Verification loop (every iteration)

```
npm install
npx expo-doctor
npm run lint
npx tsc --noEmit
```

Commit only when all four are green.
