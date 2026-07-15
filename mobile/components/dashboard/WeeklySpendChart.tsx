import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export function WeeklySpendChart({ data }: { data: { date: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const barData = data.map((d) => ({
    value: d.total,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "narrow" }),
    frontColor: "#5B6CFF",
  }));

  return (
    <View>
      <BarChart
        data={barData}
        barWidth={22}
        spacing={18}
        roundedTop
        hideRules
        maxValue={max * 1.2}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: "#5B6270", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#8B93A3", fontSize: 11 }}
        noOfSections={3}
        height={140}
        initialSpacing={10}
      />
    </View>
  );
}
