import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSalary } from "@/hooks/useSalary";
import { formatINR, currentMonthKey, todayISO } from "@/services/format";
import type { SalarySplit } from "@/services/salaryAutomation";

export default function SalaryScreen() {
  const { salaryEntries, latest, addSalaryEntry } = useSalary();
  const [gross, setGross] = useState(latest ? String(latest.grossSalary) : "");
  const [inHand, setInHand] = useState(latest ? String(latest.inHandSalary) : "");
  const [pf, setPf] = useState("");
  const [tax, setTax] = useState("");
  const [bonus, setBonus] = useState("");
  const [lastSplit, setLastSplit] = useState<SalarySplit | null>(null);

  const submit = async () => {
    if (!inHand) return;
    const split = await addSalaryEntry({
      month: currentMonthKey(),
      grossSalary: parseFloat(gross) || parseFloat(inHand) || 0,
      inHandSalary: parseFloat(inHand) || 0,
      pfContribution: parseFloat(pf) || 0,
      taxDeduction: parseFloat(tax) || 0,
      bonus: parseFloat(bonus) || 0,
      otherIncome: 0,
      creditedOn: todayISO(),
    });
    setLastSplit(split);
    setPf("");
    setTax("");
    setBonus("");
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F2F3F6" />
        </Pressable>
        <Text className="font-displayBold text-text text-xl">Salary</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {lastSplit && (
          <Card className="mb-5 bg-accentSoft border-accent/20">
            <Text className="font-bodyMedium text-text text-sm mb-3">This month's auto-split</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="font-body text-faint text-[11px]">Savings</Text>
                <Text className="font-bodySemi text-text text-sm mt-0.5">{formatINR(lastSplit.savingsAmount, { compact: true })}</Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">SIP</Text>
                <Text className="font-bodySemi text-text text-sm mt-0.5">{formatINR(lastSplit.sipAmount, { compact: true })}</Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">Emergency Fund</Text>
                <Text className="font-bodySemi text-gain text-sm mt-0.5">{formatINR(lastSplit.emergencyFundAmount, { compact: true })}</Text>
              </View>
            </View>
            <Text className="font-body text-faint text-[11px] mt-3">
              Emergency Fund amount was added automatically to your Investments. Savings and SIP are your
              targets to act on — SIPs run as separate bank debits, so we can't move that money for you.
            </Text>
          </Card>
        )}

        {latest && (
          <Card className="mb-5">
            <Text className="font-body text-muted text-xs mb-1">Latest — {latest.month}</Text>
            <Text className="font-displayBold text-text text-2xl mb-3">{formatINR(latest.inHandSalary)}</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="font-body text-faint text-[11px]">Gross</Text>
                <Text className="font-bodyMedium text-text text-xs mt-0.5">{formatINR(latest.grossSalary)}</Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">PF</Text>
                <Text className="font-bodyMedium text-text text-xs mt-0.5">{formatINR(latest.pfContribution ?? 0)}</Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">Tax</Text>
                <Text className="font-bodyMedium text-text text-xs mt-0.5">{formatINR(latest.taxDeduction ?? 0)}</Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">Bonus</Text>
                <Text className="font-bodyMedium text-gain text-xs mt-0.5">{formatINR(latest.bonus ?? 0)}</Text>
              </View>
            </View>
          </Card>
        )}

        <Text className="font-bodyMedium text-text text-sm mb-3">Log this month's salary</Text>
        <Card className="gap-3 mb-6">
          <TextField label="Gross salary" prefix="₹" keyboardType="numeric" value={gross} onChangeText={setGross} />
          <TextField label="In-hand salary" prefix="₹" keyboardType="numeric" value={inHand} onChangeText={setInHand} />
          <TextField label="PF contribution" prefix="₹" keyboardType="numeric" value={pf} onChangeText={setPf} />
          <TextField label="Tax deduction" prefix="₹" keyboardType="numeric" value={tax} onChangeText={setTax} />
          <TextField label="Bonus (optional)" prefix="₹" keyboardType="numeric" value={bonus} onChangeText={setBonus} />
          <Button label="Save salary entry" onPress={submit} />
        </Card>

        {salaryEntries.length > 0 && (
          <>
            <Text className="font-bodyMedium text-text text-sm mb-3">History</Text>
            {salaryEntries.map((s) => (
              <View key={s.id} className="flex-row items-center justify-between py-2 border-b border-border/60">
                <Text className="font-body text-muted text-xs">{s.month}</Text>
                <Text className="font-bodyMedium text-text text-sm">{formatINR(s.inHandSalary)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
