import { useMemo } from "react";
import { View, Text, SectionList, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { QUICK_ADD_CATEGORIES } from "@/constants/categories";
import { formatDateLabel, formatINR } from "@/services/format";

export default function ExpensesScreen() {
  const { expenses: all, monthTotal } = useExpenses();

  const sections = useMemo(() => {
    const byDate = new Map<string, typeof all>();
    for (const e of all) {
      const arr = byDate.get(e.date) ?? [];
      arr.push(e);
      byDate.set(e.date, arr);
    }
    return Array.from(byDate.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({
        title: date,
        total: data.reduce((s, e) => s + e.amount, 0),
        data,
      }));
  }, [all]);

  // Opens the add modal with the category pre-selected — nothing is written
  // until the user actually saves, so cancelling leaves no phantom ₹0 rows.
  const quickAdd = (categoryKey: string) => {
    router.push({ pathname: "/expenses/add", params: { category: categoryKey } });
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="font-displayBold text-text text-2xl">Expenses</Text>
            <Text className="font-body text-muted text-xs mt-1">
              {formatINR(monthTotal)} spent this month
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/expenses/add")}
            className="w-11 h-11 rounded-full bg-accent items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>

        <Text className="font-bodyMedium text-muted text-xs mb-2">Quick add for today</Text>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_ADD_CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => quickAdd(c.key)}
              className="flex-row items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-2"
            >
              <Ionicons name={c.icon} size={14} color={c.color} />
              <Text className="font-bodyMedium text-text text-xs">{c.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center justify-between bg-ink pt-4 pb-1">
            <Text className="font-bodyMedium text-muted text-xs">{formatDateLabel(section.title)}</Text>
            <Text className="font-body text-faint text-xs">{formatINR(section.total)}</Text>
          </View>
        )}
        renderItem={({ item }) => <ExpenseRow expense={item} />}
        ItemSeparatorComponent={() => <View className="h-px bg-border/60" />}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="receipt-outline" size={32} color="#5B6270" />
            <Text className="font-body text-faint text-sm mt-3">No expenses yet. Add your first one above.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
