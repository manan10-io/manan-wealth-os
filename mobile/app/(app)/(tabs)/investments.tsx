import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
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
  const { investments, totals, addInvestment, updateInvestment, deleteInvestment } = useInvestments();
  const { projections, monthlyTotal, addSip, deleteSip } = useSips();

  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSipForm, setShowSipForm] = useState(false);

  const [invName, setInvName] = useState("");
  const [invType, setInvType] = useState("mutual_fund");
  const [invInvested, setInvInvested] = useState("");
  const [invCurrent, setInvCurrent] = useState("");

  const [sipFund, setSipFund] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [sipReturn, setSipReturn] = useState("12");

  const resetInvestmentForm = () => {
    setInvName("");
    setInvType("mutual_fund");
    setInvInvested("");
    setInvCurrent("");
    setEditingId(null);
    setShowInvestmentForm(false);
  };

  const startEditing = (id: number) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return;
    setInvName(inv.name);
    setInvType(inv.type);
    setInvInvested(String(inv.investedAmount));
    setInvCurrent(String(inv.currentValue));
    setEditingId(id);
    setShowInvestmentForm(true);
  };

  const submitInvestment = async () => {
    if (!invName.trim() || !invCurrent) return;
    const values = {
      name: invName.trim(),
      type: invType,
      investedAmount: parseFloat(invInvested) || parseFloat(invCurrent) || 0,
      currentValue: parseFloat(invCurrent) || 0,
    };
    if (editingId !== null) {
      await updateInvestment(editingId, values);
    } else {
      await addInvestment(values);
    }
    resetInvestmentForm();
  };

  const confirmDeleteInvestment = (id: number, name: string) => {
    Alert.alert("Delete holding?", `“${name}” will be removed from your portfolio.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteInvestment(id) },
    ]);
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

  const confirmDeleteSip = (id: number, name: string) => {
    Alert.alert("Delete SIP?", `“${name}” and its projection will be removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSip(id) },
    ]);
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
          <Pressable onPress={() => (showInvestmentForm ? resetInvestmentForm() : setShowInvestmentForm(true))}>
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
            <Button label={editingId !== null ? "Save changes" : "Save holding"} onPress={submitInvestment} />
          </Card>
        )}

        {investments.length === 0 && !showInvestmentForm && (
          <View className="items-center py-10">
            <Ionicons name="trending-up-outline" size={32} color="#5B6270" />
            <Text className="font-body text-faint text-sm mt-3">No holdings yet. Add your first one above.</Text>
          </View>
        )}

        {investments.map((inv) => (
          <Pressable key={inv.id} onPress={() => startEditing(inv.id)}>
            <Card className="mb-2 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bodyMedium text-text text-sm">{inv.name}</Text>
                <Text className="font-body text-faint text-xs mt-0.5">
                  {INVESTMENT_TYPES.find((t) => t.key === inv.type)?.label ?? inv.type} · tap to edit
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bodySemi text-text text-sm">{formatINR(inv.currentValue, { compact: true })}</Text>
                {inv.investedAmount !== inv.currentValue && (
                  <Text
                    className={`font-body text-[11px] mt-0.5 ${
                      inv.currentValue >= inv.investedAmount ? "text-gain" : "text-loss"
                    }`}
                  >
                    {inv.currentValue >= inv.investedAmount ? "+" : ""}
                    {formatINR(inv.currentValue - inv.investedAmount, { compact: true })}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => confirmDeleteInvestment(inv.id, inv.name)} hitSlop={10} className="ml-3">
                <Ionicons name="trash-outline" size={16} color="#5B6270" />
              </Pressable>
            </Card>
          </Pressable>
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
              <Pressable onPress={() => confirmDeleteSip(sip.id, sip.fundName)} hitSlop={10}>
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
