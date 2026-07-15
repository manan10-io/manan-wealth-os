import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { goals } from "@/database/schema";
import type { Goal } from "@/database/schema";

type NewGoalInput = Omit<typeof goals.$inferInsert, "id" | "createdAt">;

export function useGoals() {
  const [all, setAll] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(goals).orderBy(desc(goals.createdAt));
    setAll(rows);
    setLoading(false);
  }, []);

  // Refetch on focus so every screen sharing this hook stays in sync.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addGoal = useCallback(
    async (entry: NewGoalInput) => {
      await db.insert(goals).values(entry);
      await refresh();
    },
    [refresh]
  );

  const updateGoalProgress = useCallback(
    async (id: number, currentAmount: number) => {
      await db.update(goals).set({ currentAmount }).where(eq(goals.id, id));
      await refresh();
    },
    [refresh]
  );

  const deleteGoal = useCallback(
    async (id: number) => {
      await db.delete(goals).where(eq(goals.id, id));
      await refresh();
    },
    [refresh]
  );

  const withProgress = useMemo(
    () =>
      all.map((g) => ({
        ...g,
        progress: g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0,
      })),
    [all]
  );

  return { goals: all, loading, refresh, addGoal, updateGoalProgress, deleteGoal, withProgress };
}
