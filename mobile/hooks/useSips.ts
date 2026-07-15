import { useCallback, useEffect, useMemo, useState } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { sips } from "@/database/schema";
import type { Sip } from "@/database/schema";

type NewSipInput = Omit<typeof sips.$inferInsert, "id">;

/** Months elapsed between an ISO start date and today (min 0). */
function monthsSince(startDateISO: string): number {
  const start = new Date(startDateISO + "T00:00:00");
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

/** Future value of a SIP using the standard monthly-compounding annuity formula. */
export function sipFutureValue(monthlyAmount: number, annualReturnPercent: number, months: number): number {
  const r = annualReturnPercent / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return monthlyAmount * months;
  return monthlyAmount * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
}

export function useSips() {
  const [all, setAll] = useState<Sip[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.select().from(sips).orderBy(desc(sips.id));
    setAll(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSip = useCallback(
    async (entry: NewSipInput) => {
      await db.insert(sips).values(entry);
      await refresh();
    },
    [refresh]
  );

  const deleteSip = useCallback(
    async (id: number) => {
      await db.delete(sips).where(eq(sips.id, id));
      await refresh();
    },
    [refresh]
  );

  const projections = useMemo(
    () =>
      all
        .filter((s) => s.active)
        .map((s) => {
          const months = monthsSince(s.startDate);
          const totalInvested = s.monthlyAmount * months;
          const currentEstValue = sipFutureValue(s.monthlyAmount, s.expectedReturnPercent, months);
          const goalPercent = s.goalAmount ? Math.min(100, (currentEstValue / s.goalAmount) * 100) : null;
          return { ...s, months, totalInvested, currentEstValue, goalPercent };
        }),
    [all]
  );

  const monthlyTotal = useMemo(
    () => all.filter((s) => s.active).reduce((sum, s) => sum + s.monthlyAmount, 0),
    [all]
  );

  return { sips: all, loading, refresh, addSip, deleteSip, projections, monthlyTotal };
}
