import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { recurringExpenses, expenses } from "@/database/schema";
import { currentMonthKey } from "@/services/format";

/**
 * Auto-logs any recurring expense (rent, Netflix, gym, internet...) whose
 * day-of-month has arrived and hasn't already been logged this month.
 * Safe to call every app launch — it's a no-op once a template has already
 * been applied for the current month.
 */
export async function applyDueRecurringExpenses(): Promise<number> {
  const month = currentMonthKey();
  const today = new Date();
  const todayDay = today.getDate();

  const templates = await db.select().from(recurringExpenses).where(eq(recurringExpenses.active, true));

  let appliedCount = 0;
  for (const t of templates) {
    if (t.lastAppliedMonth === month) continue; // already logged this month
    if (todayDay < t.dayOfMonth) continue; // due date hasn't arrived yet

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = Math.min(t.dayOfMonth, daysInMonth);
    const date = `${month}-${String(day).padStart(2, "0")}`;

    await db.insert(expenses).values({
      date,
      category: t.category,
      amount: t.amount,
      notes: `Auto-logged recurring: ${t.name}`,
      paymentMethod: "Auto",
      isRecurring: true,
    });

    await db.update(recurringExpenses).set({ lastAppliedMonth: month }).where(eq(recurringExpenses.id, t.id));
    appliedCount++;
  }

  return appliedCount;
}
