import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGoals } from "@/hooks/useGoals";
import { formatINR } from "@/services/format";

function estimateCompletion(current: number, target: number, targetDate?: string | null): string {
  if (current >= target) return "Goal reached 🎉";
  if (targetDate) {
    const d = new Date(targetDate + "T00:00:00");
    return `Targeting ${d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
  }
  return "No target date set";
}

export default function GoalsScreen() {
  const { withProgress, addGoal, updateGoalProgress, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const submit = async () => {
    if (!name.trim() || !target) return;
    await addGoal({
      name: name.trim(),
      targetAmount: parseFloat(target) || 0,
      currentAmount: parseFloat(current) || 0,
      targetDate: targetDate || null,
    });
    setName("");
    setTarget("");
    setCurrent("");
    setTargetDate("");
    setShowForm(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="font-displayBold text-text text-2xl">Goals</Text>
          <Pressable onPress={() => setShowForm((v) => !v)}>
            <Text className="font-bodyMedium text-accent text-sm">{showForm ? "Cancel" : "+ New goal"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <Card className="mb-4 gap-3">
            <TextField label="Goal name" value={name} onChangeText={setName} placeholder="e.g. Emergency Fund" />
            <TextField label="Target amount" prefix="₹" keyboardType="numeric" value={target} onChangeText={setTarget} />
            <TextField label="Current amount" prefix="₹" keyboardType="numeric" value={current} onChangeText={setCurrent} />
            <TextField label="Target date (optional)" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
            <Button label="Create goal" onPress={submit} />
          </Card>
        )}

        {withProgress.length === 0 && !showForm && (
          <View className="items-center py-16">
            <Ionicons name="flag-outline" size={32} color="#5B6270" />
            <Text className="font-body text-faint text-sm mt-3 text-center">
              No goals yet.{"\n"}Try Emergency Fund, Car Fund, or a Parents' Vacation.
            </Text>
          </View>
        )}

        {withProgress.map((g) => (
          <Card key={g.id} className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bodyMedium text-text text-sm">{g.name}</Text>
              <Pressable onPress={() => deleteGoal(g.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={16} color="#5B6270" />
              </Pressable>
            </View>
            <ProgressBar progress={g.progress} color={g.progress >= 1 ? "#33C481" : "#5B6CFF"} />
            <View className="flex-row items-center justify-between mt-2">
              <Text className="font-body text-muted text-xs">
                {formatINR(g.currentAmount, { compact: true })} / {formatINR(g.targetAmount, { compact: true })}
              </Text>
              <Text className="font-body text-faint text-xs">{Math.round(g.progress * 100)}%</Text>
            </View>
            <Text className="font-body text-faint text-[11px] mt-1">
              {estimateCompletion(g.currentAmount, g.targetAmount, g.targetDate)}
            </Text>
            <View className="flex-row gap-2 mt-3">
              <Pressable
                onPress={() => updateGoalProgress(g.id, g.currentAmount + 1000)}
                className="bg-surface2 border border-border rounded-full px-3 py-1.5"
              >
                <Text className="font-bodyMedium text-text text-xs">+₹1,000</Text>
              </Pressable>
              <Pressable
                onPress={() => updateGoalProgress(g.id, g.currentAmount + 5000)}
                className="bg-surface2 border border-border rounded-full px-3 py-1.5"
              >
                <Text className="font-bodyMedium text-text text-xs">+₹5,000</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
