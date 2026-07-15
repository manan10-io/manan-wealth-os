import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { cn } from "@/services/cn";
import type { IoniconName } from "@/constants/categories";

export function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  icon: IoniconName;
  tone?: "neutral" | "gain" | "loss" | "gold";
  sub?: string;
}) {
  const toneColor = { neutral: "#5B6CFF", gain: "#33C481", loss: "#FF6B6B", gold: "#E8B65A" }[tone];
  const toneBg = { neutral: "bg-accentSoft", gain: "bg-gainSoft", loss: "bg-lossSoft", gold: "bg-[#2A2415]" }[
    tone
  ];

  return (
    <Card className="flex-1 min-w-[47%]">
      <View className={cn("w-9 h-9 rounded-xl items-center justify-center mb-3", toneBg)}>
        <Ionicons name={icon} size={18} color={toneColor} />
      </View>
      <Text className="font-body text-muted text-xs mb-1">{label}</Text>
      <Text className="font-displayBold text-text text-lg" numberOfLines={1}>
        {value}
      </Text>
      {sub ? <Text className="font-body text-faint text-[11px] mt-1">{sub}</Text> : null}
    </Card>
  );
}
