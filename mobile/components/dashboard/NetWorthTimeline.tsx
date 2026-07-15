import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { formatINR } from "@/services/format";
import type { NetWorthSnapshot } from "@/database/schema";

export function NetWorthTimeline({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  if (snapshots.length < 2) {
    return (
      <View className="py-6 items-center">
        <Text className="font-body text-faint text-sm text-center">
          Your net worth timeline builds up automatically, one point per month.{"\n"}
          Come back next month to see the trend line.
        </Text>
      </View>
    );
  }

  const data = snapshots.map((s) => ({
    value: s.netWorth,
    label: s.month.slice(2).replace("-", "/"), // "26/07"
  }));

  const latest = snapshots[snapshots.length - 1];
  const first = snapshots[0];
  const growth = latest.netWorth - first.netWorth;

  return (
    <View>
      <View className="flex-row items-end justify-between mb-3">
        <View>
          <Text className="font-body text-faint text-[11px]">Current net worth</Text>
          <Text className="font-displayBold text-text text-xl">{formatINR(latest.netWorth, { compact: true })}</Text>
        </View>
        <Text className={`font-bodyMedium text-xs ${growth >= 0 ? "text-gain" : "text-loss"}`}>
          {growth >= 0 ? "+" : ""}
          {formatINR(growth, { compact: true })} since {first.month}
        </Text>
      </View>
      <LineChart
        data={data}
        color="#5B6CFF"
        thickness={2.5}
        curved
        areaChart
        startFillColor="#5B6CFF"
        endFillColor="#0B0D12"
        startOpacity={0.3}
        endOpacity={0}
        hideRules
        hideDataPoints={false}
        dataPointsColor="#5B6CFF"
        dataPointsRadius={3}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: "#5B6270", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#8B93A3", fontSize: 10 }}
        noOfSections={3}
        height={140}
        initialSpacing={10}
        spacing={Math.max(36, 220 / data.length)}
      />
    </View>
  );
}
