import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { ALL_CATEGORIES, PAYMENT_METHODS } from "@/constants/categories";
import { todayISO } from "@/services/format";

export type ExpenseFormValues = {
  date: string;
  category: string;
  amount: string;
  notes: string;
  paymentMethod: string;
};

export function ExpenseForm({
  defaultValues,
  onSubmit,
  onDelete,
  submitLabel = "Save expense",
}: {
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, watch, setValue, formState } = useForm<ExpenseFormValues>({
    defaultValues: {
      date: todayISO(),
      category: "food",
      amount: "",
      notes: "",
      paymentMethod: "UPI",
      ...defaultValues,
    },
  });

  const selectedCategory = watch("category");
  const selectedPayment = watch("paymentMethod");

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="amount"
        rules={{ required: "Enter an amount", validate: (v) => parseFloat(v) > 0 || "Amount must be greater than 0" }}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Amount"
            prefix="₹"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="0"
            autoFocus
            error={formState.errors.amount?.message}
          />
        )}
      />

      <View className="mt-5">
        <Text className="font-bodyMedium text-muted text-sm mb-2">Category</Text>
        <View className="flex-row flex-wrap gap-2">
          {ALL_CATEGORIES.map((c) => {
            const active = selectedCategory === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setValue("category", c.key)}
                className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 border ${
                  active ? "bg-accent border-accent" : "bg-surface2 border-border"
                }`}
              >
                <Ionicons name={c.icon} size={14} color={active ? "#fff" : c.color} />
                <Text className={`font-bodyMedium text-xs ${active ? "text-white" : "text-text"}`}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-5">
        <Text className="font-bodyMedium text-muted text-sm mb-2">Payment method</Text>
        <View className="flex-row gap-2">
          {PAYMENT_METHODS.map((m) => {
            const active = selectedPayment === m;
            return (
              <Pressable
                key={m}
                onPress={() => setValue("paymentMethod", m)}
                className={`rounded-full px-3 py-2 border ${
                  active ? "bg-accent border-accent" : "bg-surface2 border-border"
                }`}
              >
                <Text className={`font-bodyMedium text-xs ${active ? "text-white" : "text-text"}`}>{m}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <View className="mt-5">
            <TextField label="Date" value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" />
          </View>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <View className="mt-5">
            <TextField label="Notes (optional)" value={value} onChangeText={onChange} placeholder="e.g. lunch with team" />
          </View>
        )}
      />

      <View className="mt-8 gap-3">
        <Button label={submitLabel} onPress={submit} loading={submitting} />
        {onDelete ? <Button label="Delete expense" variant="danger" onPress={onDelete} /> : null}
      </View>
    </ScrollView>
  );
}
