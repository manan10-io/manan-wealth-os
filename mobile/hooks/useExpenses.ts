import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { desc, eq, like } from "drizzle-orm";
import { db } from "@/database/client";
import { expenses } from "@/database/schema";
import type { Expense, NewExpense } from "@/database/schema";
import { currentMonthKey, todayISO, toLocalISO } from "@/services/format";

export function useExpenses() {
  const [all, setAll] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(expenses).orderBy(desc(expenses.date), desc(expenses.id));
    setAll(rows);
    setLoading(false);
  }, []);

  // Tab screens stay mounted in expo-router, so refetch on every focus —
  // otherwise the list goes stale after the add/edit modals write to SQLite.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addExpense = useCallback(
    async (entry: Omit<NewExpense, "id" | "createdAt">) => {
      await db.insert(expenses).values(entry);
      await refresh();
    },
    [refresh]
  );

  const updateExpense = useCallback(
    async (id: number, patch: Partial<Omit<NewExpense, "id">>) => {
      await db.update(expenses).set(patch).where(eq(expenses.id, id));
      await refresh();
    },
    [refresh]
  );

  const deleteExpense = useCallback(
    async (id: number) => {
      await db.delete(expenses).where(eq(expenses.id, id));
      await refresh();
    },
    [refresh]
  );

  const todayTotal = useMemo(() => {
    const t = todayISO();
    return all.filter((e) => e.date === t).reduce((s, e) => s + e.amount, 0);
  }, [all]);

  const monthTotal = useMemo(() => {
    const m = currentMonthKey();
    return all.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
  }, [all]);

  const monthByCategory = useMemo(() => {
    const m = currentMonthKey();
    const map = new Map<string, number>();
    for (const e of all) {
      if (!e.date.startsWith(m)) continue;
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [all]);

  const last7Days = useMemo(() => {
    const days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = toLocalISO(new Date(Date.now() - i * 86400000));
      const total = all.filter((e) => e.date === d).reduce((s, e) => s + e.amount, 0);
      days.push({ date: d, total });
    }
    return days;
  }, [all]);

  return {
    expenses: all,
    loading,
    refresh,
    addExpense,
    updateExpense,
    deleteExpense,
    todayTotal,
    monthTotal,
    monthByCategory,
    last7Days,
  };
}

export function useExpensesByDate(date: string) {
  const [rows, setRows] = useState<Expense[]>([]);
  useEffect(() => {
    db.select()
      .from(expenses)
      .where(like(expenses.date, date))
      .then(setRows);
  }, [date]);
  return rows;
}
