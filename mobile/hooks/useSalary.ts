import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { salaryEntries } from "@/database/schema";
import type { SalaryEntry } from "@/database/schema";
import { useAppStore } from "@/store/useAppStore";
import { applySalaryAutomation, type SalarySplit } from "@/services/salaryAutomation";
import { syncCurrentMonthNetWorthSnapshot } from "@/services/netWorth";

type NewSalaryInput = Omit<typeof salaryEntries.$inferInsert, "id" | "createdAt">;

export function useSalary() {
  const [all, setAll] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(salaryEntries).orderBy(desc(salaryEntries.month));
    setAll(rows);
    setLoading(false);
  }, []);

  // Refetch on focus so every screen sharing this hook stays in sync.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addSalaryEntry = useCallback(
    async (entry: NewSalaryInput): Promise<SalarySplit | null> => {
      // One entry per month: re-logging the same month replaces the row and
      // must NOT re-run the emergency-fund top-up, or every correction would
      // silently double the automated transfer.
      const existing = await db
        .select()
        .from(salaryEntries)
        .where(eq(salaryEntries.month, entry.month));
      const isFirstEntryForMonth = existing.length === 0;

      if (isFirstEntryForMonth) {
        await db.insert(salaryEntries).values(entry);
      } else {
        await db.update(salaryEntries).set(entry).where(eq(salaryEntries.id, existing[0].id));
      }

      let split: SalarySplit | null = null;
      const profile = useAppStore.getState().profile;
      if (profile) {
        split = await applySalaryAutomation(entry.inHandSalary, profile, {
          applyEmergencyTopUp: isFirstEntryForMonth,
        });
        await syncCurrentMonthNetWorthSnapshot().catch(() => {});
      }
      await refresh();
      return split;
    },
    [refresh]
  );

  const deleteSalaryEntry = useCallback(
    async (id: number) => {
      await db.delete(salaryEntries).where(eq(salaryEntries.id, id));
      await refresh();
    },
    [refresh]
  );

  const latest = all[0] ?? null;

  return { salaryEntries: all, loading, refresh, addSalaryEntry, deleteSalaryEntry, latest };
}
