import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Switch } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { exportDatabase, importDatabase, exportEncryptedDatabase, importEncryptedDatabase } from "@/services/backup";
import { requestNotificationPermissions } from "@/services/notifications";
import type { IoniconName } from "@/constants/categories";

function LinkRow({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3 flex-1">
        <Ionicons name={icon} size={18} color="#8B93A3" />
        <View className="flex-1">
          <Text className="font-bodyMedium text-text text-sm">{label}</Text>
          {sub ? <Text className="font-body text-faint text-xs mt-0.5">{sub}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#5B6270" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const profile = useAppStore((s) => s.profile);
  const lockApp = useAppStore((s) => s.lockApp);
  const updateReminderTime = useAppStore((s) => s.updateReminderTime);
  const setReminderEnabled = useAppStore((s) => s.setReminderEnabled);
  const updateAutomationPercents = useAppStore((s) => s.updateAutomationPercents);

  const [hour, setHour] = useState(String(profile?.reminderHour ?? 21));
  const [minute, setMinute] = useState(String(profile?.reminderMinute ?? 0).padStart(2, "0"));
  const [savingsPct, setSavingsPct] = useState(String(profile?.savingsGoalPercent ?? 30));
  const [sipPct, setSipPct] = useState(String(profile?.sipAllocationPercent ?? 20));
  const [emergencyPct, setEmergencyPct] = useState(String(profile?.emergencyFundAllocationPercent ?? 10));
  const [backupPassword, setBackupPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const saveReminder = async () => {
    const h = Math.max(0, Math.min(23, parseInt(hour, 10) || 21));
    const m = Math.max(0, Math.min(59, parseInt(minute, 10) || 0));
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert("Notifications disabled", "Enable notifications in system settings to get the daily reminder.");
    }
    await updateReminderTime(h, m);
    Alert.alert("Saved", `Daily reminder set for ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  const saveAutomation = async () => {
    await updateAutomationPercents(
      parseFloat(savingsPct) || 30,
      parseFloat(sipPct) || 20,
      parseFloat(emergencyPct) || 10
    );
    Alert.alert("Saved", "Your salary-day split will use these percentages from your next salary entry.");
  };

  const withBusy = (key: string, fn: () => Promise<void>) => async () => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      Alert.alert("Something went wrong", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text className="font-displayBold text-text text-2xl mb-5">Settings</Text>

        <Text className="font-bodyMedium text-muted text-xs mb-2">MODULES</Text>
        <Card className="mb-6 divide-y divide-border">
          <LinkRow icon="sync-outline" label="Recurring expenses" sub="Rent, Netflix, gym, internet" onPress={() => router.push("/(app)/recurring")} />
          <LinkRow icon="document-text-outline" label="Monthly reports" sub="PDF summary & CSV export" onPress={() => router.push("/(app)/reports")} />
          <LinkRow icon="bar-chart-outline" label="Analytics" sub="Trends & net worth timeline" onPress={() => router.push("/(app)/analytics")} />
          <LinkRow icon="briefcase-outline" label="Salary" sub="Log monthly salary" onPress={() => router.push("/(app)/salary")} />
        </Card>

        <Text className="font-bodyMedium text-muted text-xs mb-2">DAILY REMINDER</Text>
        <Card className="mb-6 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-body text-faint text-xs flex-1 pr-3">
              “Manan, what expenses did you have today?” — sent locally, every evening.
            </Text>
            <Switch
              value={profile?.reminderEnabled ?? true}
              onValueChange={async (v) => {
                if (v) {
                  const granted = await requestNotificationPermissions();
                  if (!granted) {
                    Alert.alert(
                      "Notifications disabled",
                      "Enable notifications in system settings to get the daily reminder."
                    );
                    return;
                  }
                }
                await setReminderEnabled(v);
              }}
              trackColor={{ false: "#262B38", true: "#5B6CFF" }}
              thumbColor="#F2F3F6"
            />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Hour (0–23)" keyboardType="numeric" value={hour} onChangeText={setHour} />
            </View>
            <View className="flex-1">
              <TextField label="Minute (0–59)" keyboardType="numeric" value={minute} onChangeText={setMinute} />
            </View>
          </View>
          <Button label="Save reminder time" onPress={saveReminder} variant="secondary" />
        </Card>

        <Text className="font-bodyMedium text-muted text-xs mb-2">SALARY-DAY AUTOMATION</Text>
        <Card className="mb-6 gap-3">
          <Text className="font-body text-faint text-xs">
            When you log a salary entry, we automatically top up your Emergency Fund by its share. Savings
            and SIP percentages are shown as your target split.
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Savings %" keyboardType="numeric" value={savingsPct} onChangeText={setSavingsPct} />
            </View>
            <View className="flex-1">
              <TextField label="SIP %" keyboardType="numeric" value={sipPct} onChangeText={setSipPct} />
            </View>
            <View className="flex-1">
              <TextField label="Emergency %" keyboardType="numeric" value={emergencyPct} onChangeText={setEmergencyPct} />
            </View>
          </View>
          <Button label="Save split" onPress={saveAutomation} variant="secondary" />
        </Card>

        <Text className="font-bodyMedium text-muted text-xs mb-2">LOCAL BACKUP</Text>
        <Card className="mb-6 gap-3">
          <Text className="font-body text-faint text-xs">
            Your data lives only in one SQLite file on this phone. Export it regularly and keep the copy
            somewhere safe — there’s no cloud copy to fall back on.
          </Text>
          <Button label="Export backup (.db)" variant="secondary" onPress={withBusy("export", exportDatabase)} loading={busy === "export"} />
          <Button label="Restore from backup (.db)" variant="secondary" onPress={withBusy("import", async () => {
            const ok = await importDatabase();
            if (ok) Alert.alert("Backup restored", "Close and reopen the app for the restored data to load.");
          })} loading={busy === "import"} />

          <View className="h-px bg-border my-1" />

          <Text className="font-bodyMedium text-muted text-xs">Password-protected backup</Text>
          <TextField
            label="Backup password"
            value={backupPassword}
            onChangeText={setBackupPassword}
            secureTextEntry
            placeholder="Choose a password you'll remember"
          />
          <Button
            label="Export encrypted backup"
            variant="secondary"
            onPress={withBusy("exportEnc", () => exportEncryptedDatabase(backupPassword))}
            loading={busy === "exportEnc"}
          />
          <Button
            label="Restore encrypted backup"
            variant="secondary"
            onPress={withBusy("importEnc", async () => {
              const ok = await importEncryptedDatabase(backupPassword);
              if (ok) Alert.alert("Backup restored", "Close and reopen the app for the restored data to load.");
            })}
            loading={busy === "importEnc"}
          />
          <Text className="font-body text-faint text-[11px]">
            There’s no password recovery — if you forget it, that encrypted backup can’t be opened again.
          </Text>
        </Card>

        <Text className="font-bodyMedium text-muted text-xs mb-2">SECURITY</Text>
        <Card className="mb-6">
          <Pressable
            onPress={async () => {
              await lockApp();
              router.replace("/pin-lock");
            }}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="lock-closed-outline" size={18} color="#8B93A3" />
              <Text className="font-bodyMedium text-text text-sm">Lock now</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#5B6270" />
          </Pressable>
        </Card>

        <Text className="font-bodyMedium text-muted text-xs mb-2">ABOUT</Text>
        <Card>
          <Text className="font-bodySemi text-text text-sm mb-1">Manan Wealth OS</Text>
          <Text className="font-body text-faint text-xs leading-5">
            100% offline. No account, no analytics, no network calls. Everything you see is computed from
            the SQLite database on this device.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
