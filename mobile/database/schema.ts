import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

/**
 * Manan Wealth OS — local database schema.
 * Everything lives in a single on-device SQLite file. There is no server,
 * no sync, and no network call anywhere in this schema or the code that
 * reads/writes it.
 */

// ---------------------------------------------------------------------------
// Profile — created once, by the onboarding wizard.
// ---------------------------------------------------------------------------
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default("Manan"),
  joiningDate: text("joining_date"), // ISO date string
  expectedSalary: real("expected_salary"),
  savingsGoalPercent: real("savings_goal_percent").default(30),
  sipAllocationPercent: real("sip_allocation_percent").default(20),
  emergencyFundAllocationPercent: real("emergency_fund_allocation_percent").default(10),
  emergencyFundGoal: real("emergency_fund_goal"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
    .notNull()
    .default(false),
  pinHash: text("pin_hash"), // SHA-256 hash, never the raw PIN
  reminderHour: integer("reminder_hour").notNull().default(21), // 9 PM default
  reminderMinute: integer("reminder_minute").notNull().default(0),
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// Expenses — the daily-driver table.
// ---------------------------------------------------------------------------
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // ISO date (yyyy-MM-dd)
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  notes: text("notes"),
  paymentMethod: text("payment_method").default("UPI"),
  isRecurring: integer("is_recurring", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// Recurring expense templates (rent, Netflix, gym, internet...)
// ---------------------------------------------------------------------------
export const recurringExpenses = sqliteTable("recurring_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  dayOfMonth: integer("day_of_month").notNull().default(1),
  lastAppliedMonth: text("last_applied_month"), // yyyy-MM — guards against double auto-logging
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ---------------------------------------------------------------------------
// Salary
// ---------------------------------------------------------------------------
export const salaryEntries = sqliteTable("salary_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(), // yyyy-MM
  grossSalary: real("gross_salary").notNull(),
  inHandSalary: real("in_hand_salary").notNull(),
  pfContribution: real("pf_contribution").default(0),
  taxDeduction: real("tax_deduction").default(0),
  bonus: real("bonus").default(0),
  otherIncome: real("other_income").default(0),
  creditedOn: text("credited_on"), // ISO date
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// Investments
// ---------------------------------------------------------------------------
export const investmentTypeValues = [
  "mutual_fund",
  "stock",
  "gold",
  "fixed_deposit",
  "cash",
  "emergency_fund",
] as const;

export const investments = sqliteTable("investments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // one of investmentTypeValues
  investedAmount: real("invested_amount").notNull(),
  currentValue: real("current_value").notNull(),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// SIPs
// ---------------------------------------------------------------------------
export const sips = sqliteTable("sips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fundName: text("fund_name").notNull(),
  monthlyAmount: real("monthly_amount").notNull(),
  startDate: text("start_date").notNull(),
  expectedReturnPercent: real("expected_return_percent").notNull().default(12),
  goalAmount: real("goal_amount"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------
export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  targetDate: text("target_date"),
  icon: text("icon").default("target"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// Net worth snapshots — one row per month, for the growth timeline
// ---------------------------------------------------------------------------
export const netWorthSnapshots = sqliteTable("net_worth_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(), // yyyy-MM
  assets: real("assets").notNull(),
  liabilities: real("liabilities").notNull().default(0),
  netWorth: real("net_worth").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Profile = typeof profile.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type SalaryEntry = typeof salaryEntries.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type Sip = typeof sips.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type NetWorthSnapshot = typeof netWorthSnapshots.$inferSelect;
