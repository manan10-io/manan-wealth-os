import { useCallback, useEffect, useState } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { recurringExpenses } from "@/database/schema";
import type { RecurringExpense } from "@/database/schema";

type NewRecurringInput = Omit<typeof recurringExpenses.$inferInsert, "id" | "lastAppliedMonth">;

export function useRecurringExpenses() {
  const [all, setAll] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(recurringExpenses).orderBy(desc(recurringExpenses.id));
    setAll(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecurring = useCallback(
    async (entry: NewRecurringInput) => {
      await db.insert(recurringExpenses).values(entry);
      await refresh();
    },
    [refresh]
  );

  const toggleActive = useCallback(
    async (id: number, active: boolean) => {
      await db.update(recurringExpenses).set({ active }).where(eq(recurringExpenses.id, id));
      await refresh();
    },
    [refresh]
  );

  const deleteRecurring = useCallback(
    async (id: number) => {
      await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
      await refresh();
    },
    [refresh]
  );

  const monthlyTotal = all.filter((r) => r.active).reduce((s, r) => s + r.amount, 0);

  return { recurringExpenses: all, loading, refresh, addRecurring, toggleActive, deleteRecurring, monthlyTotal };
}
