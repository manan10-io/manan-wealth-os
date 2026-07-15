import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { WeeklySpendChart } from "@/components/dashboard/WeeklySpendChart";
import { NetWorthTimeline } from "@/components/dashboard/NetWorthTimeline";
import { useExpenses } from "@/hooks/useExpenses";
import { useSalary } from "@/hooks/useSalary";
import { useNetWorthHistory } from "@/hooks/useNetWorth";
import { useAppStore } from "@/store/useAppStore";
import { formatINR } from "@/services/format";

export default function AnalyticsScreen() {
  const { monthTotal, monthByCategory, last7Days } = useExpenses();
  const { latest } = useSalary();
  const { snapshots } = useNetWorthHistory();
  const profile = useAppStore((s) => s.profile);
  const salary = latest?.inHandSalary ?? profile?.expectedSalary ?? 0;
  const savings = Math.max(0, salary - monthTotal);

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F2F3F6" />
        </Pressable>
        <Text className="font-displayBold text-text text-xl">Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Card className="mb-4">
          <Text className="font-bodyMedium text-text text-sm mb-3">Income vs expense — this month</Text>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="font-body text-faint text-[11px] mb-1">Income</Text>
              <Text className="font-displayBold text-gain text-lg">{formatINR(salary, { compact: true })}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-body text-faint text-[11px] mb-1">Expenses</Text>
              <Text className="font-displayBold text-loss text-lg">{formatINR(monthTotal, { compact: true })}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-body text-faint text-[11px] mb-1">Saved</Text>
              <Text className="font-displayBold text-text text-lg">{formatINR(savings, { compact: true })}</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="font-bodyMedium text-text text-sm mb-3">Last 7 days spend trend</Text>
          <WeeklySpendChart data={last7Days} />
        </Card>

        <Card className="mb-4">
          <Text className="font-bodyMedium text-text text-sm mb-3">This month by category</Text>
          <CategoryDonut data={monthByCategory} total={monthTotal} />
        </Card>

        <Card className="mb-4">
          <Text className="font-bodyMedium text-text text-sm mb-3">Net worth timeline</Text>
          <NetWorthTimeline snapshots={snapshots} />
        </Card>

        <Card>
          <Text className="font-body text-faint text-xs leading-5">
            Savings trends and investment growth charts get richer as more months of data build up — the
            net worth timeline above adds one point automatically every time you open the app.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
