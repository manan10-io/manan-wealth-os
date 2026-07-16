import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

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
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(withSpring(pct, { damping: 18, stiffness: 120 }));
  }, [pct, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View
      style={{ height, borderRadius: height, backgroundColor: trackColor, overflow: "hidden" }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            borderRadius: height,
            backgroundColor: color,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
