import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { investments } from "@/database/schema";
import type { Investment } from "@/database/schema";

type NewInvestmentInput = Omit<typeof investments.$inferInsert, "id" | "createdAt">;

export function useInvestments() {
  const [all, setAll] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(investments).orderBy(desc(investments.createdAt));
    setAll(rows);
    setLoading(false);
  }, []);

  // Refetch on focus — salary automation and onboarding write to this table
  // from other screens while this one stays mounted.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addInvestment = useCallback(
    async (entry: NewInvestmentInput) => {
      await db.insert(investments).values(entry);
      await refresh();
    },
    [refresh]
  );

  const updateInvestment = useCallback(
    async (id: number, patch: Partial<NewInvestmentInput>) => {
      await db.update(investments).set(patch).where(eq(investments.id, id));
      await refresh();
    },
    [refresh]
  );

  const deleteInvestment = useCallback(
    async (id: number) => {
      await db.delete(investments).where(eq(investments.id, id));
      await refresh();
    },
    [refresh]
  );

  const totals = useMemo(() => {
    const invested = all.reduce((s, i) => s + i.investedAmount, 0);
    const current = all.reduce((s, i) => s + i.currentValue, 0);
    const emergencyFund = all
      .filter((i) => i.type === "emergency_fund")
      .reduce((s, i) => s + i.currentValue, 0);
    return {
      invested,
      current,
      returns: current - invested,
      returnsPercent: invested > 0 ? ((current - invested) / invested) * 100 : 0,
      emergencyFund,
    };
  }, [all]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of all) map.set(i.type, (map.get(i.type) ?? 0) + i.currentValue);
    return Array.from(map.entries()).map(([type, value]) => ({ type, value }));
  }, [all]);

  return { investments: all, loading, refresh, addInvestment, updateInvestment, deleteInvestment, totals, byType };
}
