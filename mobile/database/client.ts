import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

// A single on-device file. Nothing about this app ever leaves the phone.
export const sqliteConnection = SQLite.openDatabaseSync("manan-wealth-os.db");

export const db = drizzle(sqliteConnection, { schema });

/**
 * Hand-rolled, idempotent bootstrap. We use CREATE TABLE IF NOT EXISTS
 * instead of a generated migrations folder so Phase 1 has zero moving
 * parts beyond "open the app". When the schema grows in Phase 2/3,
 * add an ALTER TABLE block here guarded by a PRAGMA user_version check.
 */
export async function initDatabase() {
  await sqliteConnection.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Manan',
      joining_date TEXT,
      expected_salary REAL,
      savings_goal_percent REAL DEFAULT 30,
      sip_allocation_percent REAL DEFAULT 20,
      emergency_fund_allocation_percent REAL DEFAULT 10,
      emergency_fund_goal REAL,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      pin_hash TEXT,
      reminder_hour INTEGER NOT NULL DEFAULT 21,
      reminder_minute INTEGER NOT NULL DEFAULT 0,
      reminder_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      payment_method TEXT DEFAULT 'UPI',
      is_recurring INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      day_of_month INTEGER NOT NULL DEFAULT 1,
      last_applied_month TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS salary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      gross_salary REAL NOT NULL,
      in_hand_salary REAL NOT NULL,
      pf_contribution REAL DEFAULT 0,
      tax_deduction REAL DEFAULT 0,
      bonus REAL DEFAULT 0,
      other_income REAL DEFAULT 0,
      credited_on TEXT,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      invested_amount REAL NOT NULL,
      current_value REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );

    CREATE TABLE IF NOT EXISTS sips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_name TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      start_date TEXT NOT NULL,
      expected_return_percent REAL NOT NULL DEFAULT 12,
      goal_amount REAL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      target_date TEXT,
      icon TEXT DEFAULT 'target',
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );

    CREATE TABLE IF NOT EXISTS net_worth_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      assets REAL NOT NULL,
      liabilities REAL NOT NULL DEFAULT 0,
      net_worth REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_net_worth_month ON net_worth_snapshots(month);
  `);

  // Anyone who already has a Phase 1 database is missing these newer columns.
  // CREATE TABLE IF NOT EXISTS above is a no-op for them, so patch it forward
  // safely — SQLite has no "ADD COLUMN IF NOT EXISTS", so we just swallow the
  // "duplicate column" error on repeat runs.
  const patchColumns = [
    "ALTER TABLE profile ADD COLUMN sip_allocation_percent REAL DEFAULT 20",
    "ALTER TABLE profile ADD COLUMN emergency_fund_allocation_percent REAL DEFAULT 10",
    "ALTER TABLE recurring_expenses ADD COLUMN last_applied_month TEXT",
  ];
  for (const stmt of patchColumns) {
    await sqliteConnection.execAsync(stmt).catch(() => {});
  }
}
