import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function PinLock() {
  const profile = useAppStore((s) => s.profile);
  const unlockWithPin = useAppStore((s) => s.unlockWithPin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const onKey = async (key: string) => {
    if (key === "") return;
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      setError(false);
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      const ok = await unlockWithPin(next);
      if (ok) {
        router.replace("/(app)/(tabs)/dashboard");
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 400);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink items-center justify-between py-16">
      <View className="items-center mt-10">
        <View className="w-14 h-14 rounded-2xl bg-accentSoft items-center justify-center mb-5">
          <Ionicons name="lock-closed" size={24} color="#5B6CFF" />
        </View>
        <Text className="font-displayBold text-text text-xl mb-1">
          Welcome back{profile?.name ? `, ${profile.name}` : ""}
        </Text>
        <Text className="font-body text-muted text-sm mb-8">Enter your PIN to unlock</Text>

        <View className="flex-row gap-4">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < pin.length ? (error ? "bg-loss" : "bg-accent") : "bg-surface2 border border-border"
              }`}
            />
          ))}
        </View>
      </View>

      <View className="w-full px-10">
        <View className="flex-row flex-wrap justify-between">
          {KEYS.map((key, i) => (
            <Pressable
              key={i}
              disabled={key === ""}
              onPress={() => onKey(key)}
              className="w-[30%] aspect-square rounded-full items-center justify-center mb-4 active:bg-surface2"
            >
              {key === "back" ? (
                <Ionicons name="backspace-outline" size={22} color="#F2F3F6" />
              ) : (
                <Text className="font-display text-text text-2xl">{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
