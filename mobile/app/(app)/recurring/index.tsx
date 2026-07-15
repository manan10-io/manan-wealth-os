import { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useRecurringExpenses } from "@/hooks/useRecurringExpenses";
import { ALL_CATEGORIES, categoryByKey } from "@/constants/categories";
import { formatINR } from "@/services/format";

export default function RecurringExpensesScreen() {
  const { recurringExpenses, addRecurring, toggleActive, deleteRecurring, monthlyTotal } = useRecurringExpenses();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("bills");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  const submit = async () => {
    if (!name.trim() || !amount) return;
    await addRecurring({
      name: name.trim(),
      category,
      amount: parseFloat(amount) || 0,
      dayOfMonth: Math.max(1, Math.min(28, parseInt(dayOfMonth, 10) || 1)),
      active: true,
    });
    setName("");
    setAmount("");
    setDayOfMonth("1");
    setShowForm(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F2F3F6" />
        </Pressable>
        <Text className="font-displayBold text-text text-xl">Recurring expenses</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text className="font-body text-faint text-xs mb-4">
          Rent, Netflix, gym, internet — anything that bills you the same amount every month. We'll
          auto-log it as an expense on its due day, once, without you having to remember.
        </Text>

        <Card className="mb-5 flex-row items-center justify-between">
          <Text className="font-bodyMedium text-muted text-sm">Committed monthly total</Text>
          <Text className="font-displayBold text-text text-lg">{formatINR(monthlyTotal, { compact: true })}</Text>
        </Card>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bodyMedium text-text text-sm">Templates</Text>
          <Pressable onPress={() => setShowForm((v) => !v)}>
            <Text className="font-bodyMedium text-accent text-xs">{showForm ? "Cancel" : "+ Add"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <Card className="mb-4 gap-3">
            <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Rent" />
            <View className="flex-row flex-wrap gap-2">
              {ALL_CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`rounded-full px-3 py-1.5 border ${
                    category === c.key ? "bg-accent border-accent" : "bg-surface2 border-border"
                  }`}
                >
                  <Text className={`font-bodyMedium text-xs ${category === c.key ? "text-white" : "text-text"}`}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField label="Amount" prefix="₹" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              </View>
              <View className="flex-1">
                <TextField label="Day of month" keyboardType="numeric" value={dayOfMonth} onChangeText={setDayOfMonth} />
              </View>
            </View>
            <Button label="Save template" onPress={submit} />
          </Card>
        )}

        {recurringExpenses.length === 0 && !showForm && (
          <View className="items-center py-16">
            <Ionicons name="sync-outline" size={32} color="#5B6270" />
            <Text className="font-body text-faint text-sm mt-3">No recurring expenses set up yet.</Text>
          </View>
        )}

        {recurringExpenses.map((r) => {
          const meta = categoryByKey(r.category);
          return (
            <Card key={r.id} className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: meta.color + "22" }}>
                  <Ionicons name={meta.icon} size={16} color={meta.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-bodyMedium text-text text-sm">{r.name}</Text>
                  <Text className="font-body text-faint text-xs mt-0.5">
                    {formatINR(r.amount)} · Day {r.dayOfMonth}
                  </Text>
                </View>
              </View>
              <Switch
                value={r.active}
                onValueChange={(v) => toggleActive(r.id, v)}
                trackColor={{ false: "#262B38", true: "#5B6CFF" }}
                thumbColor="#F2F3F6"
              />
              <Pressable onPress={() => deleteRecurring(r.id)} hitSlop={10} className="ml-3">
                <Ionicons name="trash-outline" size={16} color="#5B6270" />
              </Pressable>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
