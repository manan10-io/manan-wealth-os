import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { investments } from "@/database/schema";
import type { Profile } from "@/database/schema";

export type SalarySplit = {
  savingsAmount: number;
  sipAmount: number;
  emergencyFundAmount: number;
};

/**
 * Computes the salary-day split (Savings / SIP / Emergency Fund) and applies
 * the real, on-device effect we can meaningfully automate: topping up the
 * Emergency Fund investment row by its allocated percentage.
 *
 * Savings and SIP percentages are informational — savings is already what
 * the dashboard computes as (salary - expenses), and SIPs are separate
 * recurring bank debits you track under the Investments tab, so there's no
 * single account balance for the app to move that money into. We show the
 * intended split so you can act on it, and we do the one transfer we can
 * actually make ourselves: the Emergency Fund top-up.
 */
export async function applySalaryAutomation(
  inHandSalary: number,
  profile: Pick<Profile, "savingsGoalPercent" | "sipAllocationPercent" | "emergencyFundAllocationPercent">
): Promise<SalarySplit> {
  const savingsAmount = (inHandSalary * (profile.savingsGoalPercent ?? 30)) / 100;
  const sipAmount = (inHandSalary * (profile.sipAllocationPercent ?? 20)) / 100;
  const emergencyFundAmount = (inHandSalary * (profile.emergencyFundAllocationPercent ?? 10)) / 100;

  if (emergencyFundAmount > 0) {
    const existing = await db
      .select()
      .from(investments)
      .where(eq(investments.type, "emergency_fund"));

    if (existing[0]) {
      await db
        .update(investments)
        .set({
          currentValue: existing[0].currentValue + emergencyFundAmount,
          investedAmount: existing[0].investedAmount + emergencyFundAmount,
        })
        .where(eq(investments.id, existing[0].id));
    } else {
      await db.insert(investments).values({
        name: "Emergency Fund",
        type: "emergency_fund",
        investedAmount: emergencyFundAmount,
        currentValue: emergencyFundAmount,
        notes: "Auto-funded from salary-day automation",
      });
    }
  }

  return { savingsAmount, sipAmount, emergencyFundAmount };
}
