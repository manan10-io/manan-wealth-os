import { Redirect, Stack } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function AppLayout() {
  const unlocked = useAppStore((s) => s.unlocked);

  if (!unlocked) {
    return <Redirect href="/pin-lock" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0D12" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="salary/index" options={{ presentation: "card" }} />
      <Stack.Screen name="analytics/index" options={{ presentation: "card" }} />
      <Stack.Screen name="recurring/index" options={{ presentation: "card" }} />
      <Stack.Screen name="reports/index" options={{ presentation: "card" }} />
    </Stack>
  );
}
