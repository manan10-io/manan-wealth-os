import { View, type ViewProps } from "react-native";
import { cn } from "@/services/cn";

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "bg-surface border border-border rounded-xl2 p-4",
        className
      )}
      {...props}
    />
  );
}
