import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { investments, netWorthSnapshots } from "@/database/schema";
import { currentMonthKey } from "@/services/format";

/**
 * Recomputes and upserts this month's net worth snapshot from current
 * investment values. Liabilities aren't tracked yet (Phase 3 backlog item),
 * so net worth = total current investment value for now.
 */
export async function syncCurrentMonthNetWorthSnapshot(): Promise<void> {
  const month = currentMonthKey();
  const invRows = await db.select().from(investments);
  const assets = invRows.reduce((s, i) => s + i.currentValue, 0);
  const liabilities = 0;
  const netWorth = assets - liabilities;

  const existing = await db
    .select()
    .from(netWorthSnapshots)
    .where(eq(netWorthSnapshots.month, month));

  if (existing[0]) {
    await db
      .update(netWorthSnapshots)
      .set({ assets, liabilities, netWorth })
      .where(eq(netWorthSnapshots.id, existing[0].id));
  } else {
    await db.insert(netWorthSnapshots).values({ month, assets, liabilities, netWorth });
  }
}
