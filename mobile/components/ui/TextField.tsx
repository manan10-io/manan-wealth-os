import { View, Text, TextInput, type TextInputProps } from "react-native";
import { cn } from "@/services/cn";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: string;
};

export function TextField({ label, error, prefix, className, ...props }: Props & { className?: string }) {
  return (
    <View className="w-full">
      {label ? <Text className="font-bodyMedium text-muted text-sm mb-2">{label}</Text> : null}
      <View
        className={cn(
          "flex-row items-center bg-surface2 border rounded-2xl px-4",
          error ? "border-loss" : "border-border"
        )}
      >
        {prefix ? <Text className="font-bodySemi text-muted mr-1">{prefix}</Text> : null}
        <TextInput
          placeholderTextColor="#5B6270"
          className={cn("flex-1 font-body text-text text-base py-4", className)}
          {...props}
        />
      </View>
      {error ? <Text className="font-body text-loss text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
