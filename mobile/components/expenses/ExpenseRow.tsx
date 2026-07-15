import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { categoryByKey } from "@/constants/categories";
import { formatINR } from "@/services/format";
import type { Expense } from "@/database/schema";

export function ExpenseRow({ expense }: { expense: Expense }) {
  const meta = categoryByKey(expense.category);
  return (
    <Pressable
      onPress={() => router.push(`/expenses/${expense.id}`)}
      className="flex-row items-center justify-between py-3 active:opacity-70"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: meta.color + "22" }}
        >
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View className="flex-1">
          <Text className="font-bodyMedium text-text text-sm">{meta.label}</Text>
          {expense.notes ? (
            <Text className="font-body text-faint text-xs mt-0.5" numberOfLines={1}>
              {expense.notes}
            </Text>
          ) : null}
        </View>
      </View>
      <Text className="font-bodySemi text-text text-sm">{formatINR(expense.amount)}</Text>
    </Pressable>
  );
}
