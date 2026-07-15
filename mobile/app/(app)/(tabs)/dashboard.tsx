import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatTile } from "@/components/dashboard/StatTile";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { WeeklySpendChart } from "@/components/dashboard/WeeklySpendChart";
import { useAppStore } from "@/store/useAppStore";
import { useExpenses } from "@/hooks/useExpenses";
import { useInvestments } from "@/hooks/useInvestments";
import { useSips } from "@/hooks/useSips";
import { useSalary } from "@/hooks/useSalary";
import { formatINR } from "@/services/format";

export default function Dashboard() {
  const profile = useAppStore((s) => s.profile);
  const { monthTotal, todayTotal, monthByCategory, last7Days } = useExpenses();
  const { totals: investmentTotals } = useInvestments();
  const { monthlyTotal: sipMonthlyTotal } = useSips();
  const { latest: latestSalary } = useSalary();

  const salary = latestSalary?.inHandSalary ?? profile?.expectedSalary ?? 0;
  const savings = Math.max(0, salary - monthTotal);
  const savingsPercent = salary > 0 ? Math.round((savings / salary) * 100) : 0;
  const netWorth = investmentTotals.current;
  const emergencyGoal = profile?.emergencyFundGoal ?? 0;
  const emergencyProgress = emergencyGoal > 0 ? investmentTotals.emergencyFund / emergencyGoal : 0;

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="font-body text-muted text-sm">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <Text className="font-displayBold text-text text-2xl mt-1">
              Hey {profile?.name ?? "Manan"} 👋
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/settings")}
            className="w-11 h-11 rounded-full bg-surface2 items-center justify-center"
          >
            <Ionicons name="person-outline" size={20} color="#F2F3F6" />
          </Pressable>
        </View>

        <Card className="bg-accentSoft border-accent/20 mb-4">
          <Text className="font-body text-muted text-xs mb-1">Spent today</Text>
          <Text className="font-displayBold text-text text-3xl">{formatINR(todayTotal)}</Text>
          <Pressable
            onPress={() => router.push("/expenses/add")}
            className="flex-row items-center gap-1 mt-3 self-start bg-accent rounded-full px-4 py-2"
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="font-bodySemi text-white text-xs">Log an expense</Text>
          </Pressable>
        </Card>

        <View className="flex-row flex-wrap gap-3 mb-4">
          <StatTile label="This month spent" value={formatINR(monthTotal, { compact: true })} icon="wallet-outline" tone="loss" />
          <StatTile label="Salary (in-hand)" value={formatINR(salary, { compact: true })} icon="cash-outline" tone="gain" />
          <StatTile
            label="Savings this month"
            value={formatINR(savings, { compact: true })}
            icon="trending-up-outline"
            tone="gain"
            sub={`${savingsPercent}% of salary`}
          />
          <StatTile
            label="Net worth"
            value={formatINR(netWorth, { compact: true })}
            icon="stats-chart-outline"
            tone="gold"
          />
          <StatTile
            label="Investments"
            value={formatINR(investmentTotals.current, { compact: true })}
            icon="pie-chart-outline"
          />
          <StatTile
            label="Monthly SIP"
            value={formatINR(sipMonthlyTotal, { compact: true })}
            icon="repeat-outline"
          />
        </View>

        {emergencyGoal > 0 && (
          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bodyMedium text-text text-sm">Emergency fund</Text>
              <Text className="font-body text-muted text-xs">
                {formatINR(investmentTotals.emergencyFund, { compact: true })} / {formatINR(emergencyGoal, { compact: true })}
              </Text>
            </View>
            <ProgressBar progress={emergencyProgress} color="#E8B65A" />
          </Card>
        )}

        <Card className="mb-4">
          <Text className="font-bodyMedium text-text text-sm mb-3">Last 7 days</Text>
          <WeeklySpendChart data={last7Days} />
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bodyMedium text-text text-sm">Spending by category</Text>
            <Pressable onPress={() => router.push("/(app)/analytics")}>
              <Text className="font-body text-accent text-xs">See analytics →</Text>
            </Pressable>
          </View>
          <CategoryDonut data={monthByCategory} total={monthTotal} />
        </Card>

        <Pressable
          onPress={() => router.push("/(app)/salary")}
          className="flex-row items-center justify-between bg-surface border border-border rounded-xl2 p-4"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="briefcase-outline" size={18} color="#8B93A3" />
            <Text className="font-bodyMedium text-text text-sm">Manage salary details</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#5B6270" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
