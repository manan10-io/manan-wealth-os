import { create } from "zustand";
import { eq } from "drizzle-orm";
import { db, initDatabase } from "@/database/client";
import { profile as profileTable } from "@/database/schema";
import type { Profile } from "@/database/schema";
import { hashPin, verifyPin, markUnlocked, isUnlocked as checkUnlocked, lock as lockSession } from "@/services/pin";
import { scheduleDailyReminder } from "@/services/notifications";
import { applyDueRecurringExpenses } from "@/services/recurring";
import { syncCurrentMonthNetWorthSnapshot } from "@/services/netWorth";

export type OnboardingInput = {
  name: string;
  joiningDate: string;
  expectedSalary: number;
  savingsGoalPercent: number;
  emergencyFundGoal: number;
  pin: string;
};

type AppState = {
  ready: boolean;
  profile: Profile | null;
  unlocked: boolean;
  bootstrap: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockApp: () => Promise<void>;
  updateReminderTime: (hour: number, minute: number) => Promise<void>;
  updateAutomationPercents: (savings: number, sip: number, emergency: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  profile: null,
  unlocked: false,

  bootstrap: async () => {
    await initDatabase();
    const rows = await db.select().from(profileTable).limit(1);
    const p = rows[0] ?? null;
    const unlocked = p ? await checkUnlocked() : true; // no PIN set yet -> nothing to unlock
    if (p?.onboardingCompleted) {
      await applyDueRecurringExpenses().catch(() => {});
      await syncCurrentMonthNetWorthSnapshot().catch(() => {});
    }
    set({ ready: true, profile: p, unlocked });
  },

  refreshProfile: async () => {
    const rows = await db.select().from(profileTable).limit(1);
    set({ profile: rows[0] ?? null });
  },

  completeOnboarding: async (input) => {
    const pinHash = await hashPin(input.pin);
    await db.insert(profileTable).values({
      name: input.name || "Manan",
      joiningDate: input.joiningDate,
      expectedSalary: input.expectedSalary,
      savingsGoalPercent: input.savingsGoalPercent,
      emergencyFundGoal: input.emergencyFundGoal,
      onboardingCompleted: true,
      pinHash,
      reminderHour: 21,
      reminderMinute: 0,
      reminderEnabled: true,
    });
    await markUnlocked();
    await scheduleDailyReminder(21, 0).catch(() => {
      // Permission may not be granted yet; the reminder can be (re)armed
      // from Settings without blocking onboarding.
    });
    await get().refreshProfile();
    set({ unlocked: true });
  },

  unlockWithPin: async (pin) => {
    const p = get().profile;
    if (!p?.pinHash) return false;
    const ok = await verifyPin(pin, p.pinHash);
    if (ok) {
      await markUnlocked();
      set({ unlocked: true });
    }
    return ok;
  },

  lockApp: async () => {
    await lockSession();
    set({ unlocked: false });
  },

  updateReminderTime: async (hour, minute) => {
    const p = get().profile;
    if (!p) return;
    await db
      .update(profileTable)
      .set({ reminderHour: hour, reminderMinute: minute })
      .where(eq(profileTable.id, p.id));
    await scheduleDailyReminder(hour, minute);
    await get().refreshProfile();
  },

  updateAutomationPercents: async (savings, sip, emergency) => {
    const p = get().profile;
    if (!p) return;
    await db
      .update(profileTable)
      .set({
        savingsGoalPercent: savings,
        sipAllocationPercent: sip,
        emergencyFundAllocationPercent: emergency,
      })
      .where(eq(profileTable.id, p.id));
    await get().refreshProfile();
  },
}));
