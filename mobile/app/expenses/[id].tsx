import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { eq } from "drizzle-orm";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expenses/ExpenseForm";
import { db } from "@/database/client";
import { expenses } from "@/database/schema";
import type { Expense } from "@/database/schema";

export default function EditExpense() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    db.select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .then((rows) => setExpense(rows[0] ?? null));
  }, [expenseId]);

  if (!expense) {
    return (
      <SafeAreaView className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator color="#5B6CFF" />
      </SafeAreaView>
    );
  }

  const defaultValues: Partial<ExpenseFormValues> = {
    date: expense.date,
    category: expense.category,
    amount: expense.amount ? String(expense.amount) : "",
    notes: expense.notes ?? "",
    paymentMethod: expense.paymentMethod ?? "UPI",
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <Text className="font-displayBold text-text text-xl">Edit expense</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color="#8B93A3" />
        </Pressable>
      </View>
      <ExpenseForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await db
            .update(expenses)
            .set({
              date: values.date,
              category: values.category,
              amount: parseFloat(values.amount) || 0,
              notes: values.notes || null,
              paymentMethod: values.paymentMethod,
            })
            .where(eq(expenses.id, expenseId));
          router.back();
        }}
        onDelete={async () => {
          await db.delete(expenses).where(eq(expenses.id, expenseId));
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
