import { useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/database/client";
import { investments as investmentsTable, sips as sipsTable } from "@/database/schema";
import { formatINR } from "@/services/format";

type DraftInvestment = { name: string; type: string; currentValue: string };
type DraftSip = { fundName: string; monthlyAmount: string };

const STEPS = [
  "welcome",
  "profile",
  "salary",
  "goals",
  "investments",
  "sips",
  "pin",
] as const;

export default function Onboarding() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("Manan");
  const [joiningDate, setJoiningDate] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [savingsGoalPercent, setSavingsGoalPercent] = useState("30");
  const [emergencyFundGoal, setEmergencyFundGoal] = useState("");

  const [draftInvestments, setDraftInvestments] = useState<DraftInvestment[]>([]);
  const [draftSips, setDraftSips] = useState<DraftSip[]>([]);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (pin.length !== 4) return setPinError("PIN must be 4 digits");
    if (pin !== confirmPin) return setPinError("PINs don't match");
    setPinError("");
    setSubmitting(true);
    try {
      await completeOnboarding({
        name: name.trim() || "Manan",
        joiningDate,
        expectedSalary: parseFloat(expectedSalary) || 0,
        savingsGoalPercent: parseFloat(savingsGoalPercent) || 30,
        emergencyFundGoal: parseFloat(emergencyFundGoal) || 0,
        pin,
      });

      for (const inv of draftInvestments) {
        if (!inv.name.trim() || !inv.currentValue) continue;
        const val = parseFloat(inv.currentValue) || 0;
        await db.insert(investmentsTable).values({
          name: inv.name.trim(),
          type: inv.type,
          investedAmount: val,
          currentValue: val,
        });
      }
      for (const sip of draftSips) {
        if (!sip.fundName.trim() || !sip.monthlyAmount) continue;
        await db.insert(sipsTable).values({
          fundName: sip.fundName.trim(),
          monthlyAmount: parseFloat(sip.monthlyAmount) || 0,
          startDate: new Date().toISOString().slice(0, 10),
          expectedReturnPercent: 12,
        });
      }

      router.replace("/(app)/(tabs)/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-6 pt-2">
          {step > 0 ? (
            <View className="flex-row items-center gap-3 mb-4">
              <Pressable onPress={goBack} hitSlop={12}>
                <Ionicons name="chevron-back" size={24} color="#F2F3F6" />
              </Pressable>
              <View className="flex-1">
                <ProgressBar progress={step / (STEPS.length - 1)} />
              </View>
            </View>
          ) : null}
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {STEPS[step] === "welcome" && (
            <View className="pt-16">
              <Text className="font-displayBold text-4xl text-text mb-3">
                Welcome to your{"\n"}Wealth OS.
              </Text>
              <Text className="font-body text-muted text-base leading-6">
                A private, offline finance system — built for life after Maruti Suzuki.
                Nothing here ever leaves your phone.
              </Text>
              <View className="mt-10 gap-3">
                <OnboardingBullet text="Log expenses in seconds, every day" />
                <OnboardingBullet text="Track salary, SIPs, investments & goals" />
                <OnboardingBullet text="100% local — no account, no cloud" />
              </View>
            </View>
          )}

          {STEPS[step] === "profile" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Let's set the basics" subtitle="Step 1 of 6 · Your profile" />
              <TextField label="What should we call you?" value={name} onChangeText={setName} placeholder="Manan" />
              <TextField
                label="Joining date at Maruti Suzuki"
                value={joiningDate}
                onChangeText={setJoiningDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}

          {STEPS[step] === "salary" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Expected salary" subtitle="Step 2 of 6 · Income" />
              <TextField
                label="Expected monthly in-hand salary"
                value={expectedSalary}
                onChangeText={setExpectedSalary}
                placeholder="75000"
                prefix="₹"
                keyboardType="numeric"
              />
              <Text className="font-body text-faint text-xs">
                You can add exact salary slips later in the Salary tab. This is just a starting point for your dashboard.
              </Text>
            </View>
          )}

          {STEPS[step] === "goals" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Your savings targets" subtitle="Step 3 of 6 · Goals" />
              <TextField
                label="Savings goal (% of salary)"
                value={savingsGoalPercent}
                onChangeText={setSavingsGoalPercent}
                placeholder="30"
                keyboardType="numeric"
              />
              <TextField
                label="Emergency fund target"
                value={emergencyFundGoal}
                onChangeText={setEmergencyFundGoal}
                placeholder="300000"
                prefix="₹"
                keyboardType="numeric"
              />
              <Text className="font-body text-faint text-xs">
                A common rule of thumb is 6 months of expenses. You can change this anytime in Settings.
              </Text>
            </View>
          )}

          {STEPS[step] === "investments" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Existing investments" subtitle="Step 4 of 6 · Optional" />
              <Text className="font-body text-faint text-xs -mt-3">
                Add anything you already hold — mutual funds, stocks, gold, FDs. Skip if you’re starting fresh.
              </Text>
              {draftInvestments.map((inv, i) => (
                <Card key={i} className="gap-3">
                  <TextField
                    label="Name"
                    value={inv.name}
                    placeholder="e.g. Parag Parikh Flexi Cap"
                    onChangeText={(v) =>
                      setDraftInvestments((arr) => arr.map((a, idx) => (idx === i ? { ...a, name: v } : a)))
                    }
                  />
                  <TextField
                    label="Current value"
                    value={inv.currentValue}
                    prefix="₹"
                    keyboardType="numeric"
                    onChangeText={(v) =>
                      setDraftInvestments((arr) =>
                        arr.map((a, idx) => (idx === i ? { ...a, currentValue: v } : a))
                      )
                    }
                  />
                  <Pressable onPress={() => setDraftInvestments((arr) => arr.filter((_, idx) => idx !== i))}>
                    <Text className="font-bodyMedium text-loss text-sm">Remove</Text>
                  </Pressable>
                </Card>
              ))}
              <Button
                label="+ Add investment"
                variant="secondary"
                onPress={() =>
                  setDraftInvestments((arr) => [...arr, { name: "", type: "mutual_fund", currentValue: "" }])
                }
              />
            </View>
          )}

          {STEPS[step] === "sips" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Active SIPs" subtitle="Step 5 of 6 · Optional" />
              <Text className="font-body text-faint text-xs -mt-3">
                Your running SIPs — we’ll project their future value on the SIP tab.
              </Text>
              {draftSips.map((sip, i) => (
                <Card key={i} className="gap-3">
                  <TextField
                    label="Fund name"
                    value={sip.fundName}
                    placeholder="e.g. Nifty 50 Index Fund"
                    onChangeText={(v) =>
                      setDraftSips((arr) => arr.map((a, idx) => (idx === i ? { ...a, fundName: v } : a)))
                    }
                  />
                  <TextField
                    label="Monthly SIP amount"
                    value={sip.monthlyAmount}
                    prefix="₹"
                    keyboardType="numeric"
                    onChangeText={(v) =>
                      setDraftSips((arr) => arr.map((a, idx) => (idx === i ? { ...a, monthlyAmount: v } : a)))
                    }
                  />
                  <Pressable onPress={() => setDraftSips((arr) => arr.filter((_, idx) => idx !== i))}>
                    <Text className="font-bodyMedium text-loss text-sm">Remove</Text>
                  </Pressable>
                </Card>
              ))}
              <Button
                label="+ Add SIP"
                variant="secondary"
                onPress={() => setDraftSips((arr) => [...arr, { fundName: "", monthlyAmount: "" }])}
              />
            </View>
          )}

          {STEPS[step] === "pin" && (
            <View className="pt-8 gap-5">
              <StepHeader title="Set a 4-digit PIN" subtitle="Step 6 of 6 · Security" />
              <Text className="font-body text-faint text-xs -mt-3">
                This locks the app on your device only. It’s never sent anywhere — there’s nowhere to send it.
              </Text>
              <TextField
                label="Enter PIN"
                value={pin}
                onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
              />
              <TextField
                label="Confirm PIN"
                value={confirmPin}
                onChangeText={(v) => setConfirmPin(v.replace(/\D/g, "").slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                error={pinError}
              />
              {expectedSalary ? (
                <Card>
                  <Text className="font-bodyMedium text-muted text-xs mb-1">Your dashboard will start with</Text>
                  <Text className="font-displayBold text-text text-xl">
                    {formatINR(parseFloat(expectedSalary) || 0)} / month
                  </Text>
                </Card>
              ) : null}
            </View>
          )}
        </ScrollView>

        <View className="px-6 pb-4 pt-2">
          {STEPS[step] === "welcome" ? (
            <Button label="Get started" onPress={goNext} />
          ) : STEPS[step] === "pin" ? (
            <Button label="Initialize my dashboard" onPress={finish} loading={submitting} />
          ) : (
            <Button label="Continue" onPress={goNext} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="font-bodyMedium text-accent text-xs mb-2 uppercase tracking-wide">{subtitle}</Text>
      <Text className="font-displayBold text-text text-2xl">{title}</Text>
    </View>
  );
}

function OnboardingBullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-6 h-6 rounded-full bg-accentSoft items-center justify-center">
        <Ionicons name="checkmark" size={14} color="#5B6CFF" />
      </View>
      <Text className="font-body text-text text-sm flex-1">{text}</Text>
    </View>
  );
}
