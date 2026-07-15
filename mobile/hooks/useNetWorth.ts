import { useCallback, useEffect, useState } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/database/client";
import { netWorthSnapshots } from "@/database/schema";
import type { NetWorthSnapshot } from "@/database/schema";
import { syncCurrentMonthNetWorthSnapshot } from "@/services/netWorth";

export function useNetWorthHistory() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    await syncCurrentMonthNetWorthSnapshot();
    const rows = await db.select().from(netWorthSnapshots).orderBy(asc(netWorthSnapshots.month));
    setSnapshots(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshots, loading, refresh };
}
