import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { categoryByKey } from "@/constants/categories";
import { formatINR } from "@/services/format";

export function CategoryDonut({
  data,
  total,
}: {
  data: { category: string; total: number }[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="font-body text-faint text-sm">No expenses logged this month yet.</Text>
      </View>
    );
  }

  const pieData = data.slice(0, 6).map((d) => ({
    value: d.total,
    color: categoryByKey(d.category).color,
    text: "",
  }));

  return (
    <View className="flex-row items-center">
      <PieChart
        data={pieData}
        donut
        radius={64}
        innerRadius={44}
        innerCircleColor="#14171F"
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="font-body text-faint text-[10px]">Total</Text>
            <Text className="font-bodySemi text-text text-sm">{formatINR(total, { compact: true })}</Text>
          </View>
        )}
      />
      <View className="flex-1 ml-4 gap-2">
        {data.slice(0, 6).map((d) => {
          const meta = categoryByKey(d.category);
          return (
            <View key={d.category} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <Text className="font-body text-muted text-xs flex-1" numberOfLines={1}>
                  {meta.label}
                </Text>
              </View>
              <Text className="font-bodyMedium text-text text-xs">{formatINR(d.total, { compact: true })}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
