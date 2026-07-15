import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { db } from "@/database/client";
import { expenses } from "@/database/schema";

export default function AddExpense() {
  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <Text className="font-displayBold text-text text-xl">Add expense</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color="#8B93A3" />
        </Pressable>
      </View>
      <ExpenseForm
        onSubmit={async (values) => {
          await db.insert(expenses).values({
            date: values.date,
            category: values.category,
            amount: parseFloat(values.amount) || 0,
            notes: values.notes || null,
            paymentMethod: values.paymentMethod,
          });
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
