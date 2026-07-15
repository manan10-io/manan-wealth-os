import "../global.css";
import { useEffect, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts as useSora, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { useAppStore } from "@/store/useAppStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const [soraLoaded] = useSora({ Sora_600SemiBold, Sora_700Bold });
  const ready = useAppStore((s) => s.ready);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const onLayout = useCallback(async () => {
    if (interLoaded && soraLoaded && ready) {
      await SplashScreen.hideAsync();
    }
  }, [interLoaded, soraLoaded, ready]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!interLoaded || !soraLoaded || !ready) {
    return <View className="flex-1 bg-ink" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0D12" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="pin-lock" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="expenses/add"
            options={{ presentation: "modal", contentStyle: { backgroundColor: "#0B0D12" } }}
          />
          <Stack.Screen
            name="expenses/[id]"
            options={{ presentation: "modal", contentStyle: { backgroundColor: "#0B0D12" } }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
