import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { exportMonthlyReportPDF, exportExpensesCSV } from "@/services/reports";

export default function ReportsScreen() {
  const [busy, setBusy] = useState<"pdf" | "csv" | null>(null);

  const runPdf = async () => {
    setBusy("pdf");
    try {
      await exportMonthlyReportPDF();
    } catch (e) {
      Alert.alert("Export failed", e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const runCsv = async () => {
    setBusy("csv");
    try {
      await exportExpensesCSV();
    } catch (e) {
      Alert.alert("Export failed", e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F2F3F6" />
        </Pressable>
        <Text className="font-displayBold text-text text-xl">Monthly reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Card className="mb-4 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-lossSoft items-center justify-center">
              <Ionicons name="document-text-outline" size={18} color="#FF6B6B" />
            </View>
            <View className="flex-1">
              <Text className="font-bodyMedium text-text text-sm">Monthly closing report (PDF)</Text>
              <Text className="font-body text-faint text-xs mt-0.5">
                Expense, savings, investment & net worth summary
              </Text>
            </View>
          </View>
          <Button label="Generate & share PDF" variant="secondary" onPress={runPdf} loading={busy === "pdf"} />
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-gainSoft items-center justify-center">
              <Ionicons name="grid-outline" size={18} color="#33C481" />
            </View>
            <View className="flex-1">
              <Text className="font-bodyMedium text-text text-sm">Full expense log (Excel-compatible CSV)</Text>
              <Text className="font-body text-faint text-xs mt-0.5">Opens directly in Excel, Sheets, or Numbers</Text>
            </View>
          </View>
          <Button label="Generate & share CSV" variant="secondary" onPress={runCsv} loading={busy === "csv"} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
