import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useInvestments } from "@/hooks/useInvestments";
import { useSips } from "@/hooks/useSips";
import { formatINR, todayISO } from "@/services/format";

const INVESTMENT_TYPES = [
  { key: "mutual_fund", label: "Mutual Fund" },
  { key: "stock", label: "Stock" },
  { key: "gold", label: "Gold" },
  { key: "fixed_deposit", label: "Fixed Deposit" },
  { key: "cash", label: "Cash" },
  { key: "emergency_fund", label: "Emergency Fund" },
];

export default function InvestmentsScreen() {
  const { investments, totals, addInvestment, deleteInvestment } = useInvestments();
  const { projections, monthlyTotal, addSip, deleteSip } = useSips();

  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [showSipForm, setShowSipForm] = useState(false);

  const [invName, setInvName] = useState("");
  const [invType, setInvType] = useState("mutual_fund");
  const [invInvested, setInvInvested] = useState("");
  const [invCurrent, setInvCurrent] = useState("");

  const [sipFund, setSipFund] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [sipReturn, setSipReturn] = useState("12");

  const submitInvestment = async () => {
    if (!invName.trim() || !invCurrent) return;
    await addInvestment({
      name: invName.trim(),
      type: invType,
      investedAmount: parseFloat(invInvested) || parseFloat(invCurrent) || 0,
      currentValue: parseFloat(invCurrent) || 0,
    });
    setInvName("");
    setInvInvested("");
    setInvCurrent("");
    setShowInvestmentForm(false);
  };

  const submitSip = async () => {
    if (!sipFund.trim() || !sipAmount) return;
    await addSip({
      fundName: sipFund.trim(),
      monthlyAmount: parseFloat(sipAmount) || 0,
      startDate: todayISO(),
      expectedReturnPercent: parseFloat(sipReturn) || 12,
    });
    setSipFund("");
    setSipAmount("");
    setShowSipForm(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text className="font-displayBold text-text text-2xl mb-1">Investments</Text>
        <Text className="font-body text-muted text-xs mb-5">
          {investments.length} holdings · {formatINR(totals.current, { compact: true })} current value
        </Text>

        <View className="flex-row gap-3 mb-5">
          <Card className="flex-1">
            <Text className="font-body text-muted text-xs mb-1">Invested</Text>
            <Text className="font-displayBold text-text text-lg">{formatINR(totals.invested, { compact: true })}</Text>
          </Card>
          <Card className="flex-1">
            <Text className="font-body text-muted text-xs mb-1">Returns</Text>
            <Text className={`font-displayBold text-lg ${totals.returns >= 0 ? "text-gain" : "text-loss"}`}>
              {totals.returns >= 0 ? "+" : ""}
              {formatINR(totals.returns, { compact: true })}
            </Text>
          </Card>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bodyMedium text-text text-sm">Holdings</Text>
          <Pressable onPress={() => setShowInvestmentForm((v) => !v)}>
            <Text className="font-bodyMedium text-accent text-xs">
              {showInvestmentForm ? "Cancel" : "+ Add holding"}
            </Text>
          </Pressable>
        </View>

        {showInvestmentForm && (
          <Card className="mb-4 gap-3">
            <TextField label="Name" value={invName} onChangeText={setInvName} placeholder="e.g. Nifty 50 Index Fund" />
            <View className="flex-row flex-wrap gap-2">
              {INVESTMENT_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setInvType(t.key)}
                  className={`rounded-full px-3 py-1.5 border ${
                    invType === t.key ? "bg-accent border-accent" : "bg-surface2 border-border"
                  }`}
                >
                  <Text className={`font-bodyMedium text-xs ${invType === t.key ? "text-white" : "text-text"}`}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextField label="Invested amount" prefix="₹" keyboardType="numeric" value={invInvested} onChangeText={setInvInvested} />
            <TextField label="Current value" prefix="₹" keyboardType="numeric" value={invCurrent} onChangeText={setInvCurrent} />
            <Button label="Save holding" onPress={submitInvestment} />
          </Card>
        )}

        {investments.map((inv) => (
          <Card key={inv.id} className="mb-2 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-bodyMedium text-text text-sm">{inv.name}</Text>
              <Text className="font-body text-faint text-xs mt-0.5">
                {INVESTMENT_TYPES.find((t) => t.key === inv.type)?.label ?? inv.type}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-bodySemi text-text text-sm">{formatINR(inv.currentValue, { compact: true })}</Text>
            </View>
            <Pressable onPress={() => deleteInvestment(inv.id)} hitSlop={10} className="ml-3">
              <Ionicons name="trash-outline" size={16} color="#5B6270" />
            </Pressable>
          </Card>
        ))}

        <View className="flex-row items-center justify-between mb-3 mt-6">
          <Text className="font-bodyMedium text-text text-sm">
            SIPs · {formatINR(monthlyTotal, { compact: true })}/mo
          </Text>
          <Pressable onPress={() => setShowSipForm((v) => !v)}>
            <Text className="font-bodyMedium text-accent text-xs">{showSipForm ? "Cancel" : "+ Add SIP"}</Text>
          </Pressable>
        </View>

        {showSipForm && (
          <Card className="mb-4 gap-3">
            <TextField label="Fund name" value={sipFund} onChangeText={setSipFund} placeholder="e.g. Parag Parikh Flexi Cap" />
            <TextField label="Monthly amount" prefix="₹" keyboardType="numeric" value={sipAmount} onChangeText={setSipAmount} />
            <TextField label="Expected annual return %" keyboardType="numeric" value={sipReturn} onChangeText={setSipReturn} />
            <Button label="Save SIP" onPress={submitSip} />
          </Card>
        )}

        {projections.map((sip) => (
          <Card key={sip.id} className="mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-bodyMedium text-text text-sm flex-1">{sip.fundName}</Text>
              <Pressable onPress={() => deleteSip(sip.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={16} color="#5B6270" />
              </Pressable>
            </View>
            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="font-body text-faint text-[11px]">Invested so far</Text>
                <Text className="font-bodyMedium text-text text-xs mt-0.5">
                  {formatINR(sip.totalInvested, { compact: true })}
                </Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">Est. current value</Text>
                <Text className="font-bodyMedium text-gain text-xs mt-0.5">
                  {formatINR(sip.currentEstValue, { compact: true })}
                </Text>
              </View>
              <View>
                <Text className="font-body text-faint text-[11px]">Monthly SIP</Text>
                <Text className="font-bodyMedium text-text text-xs mt-0.5">{formatINR(sip.monthlyAmount)}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
