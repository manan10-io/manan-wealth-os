import { View } from "react-native";

export function ProgressBar({
  progress,
  color = "#5B6CFF",
  trackColor = "#1B1F2A",
  height = 8,
}: {
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{ height, borderRadius: height, backgroundColor: trackColor, overflow: "hidden" }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
