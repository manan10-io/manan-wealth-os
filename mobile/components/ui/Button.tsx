import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cn } from "@/services/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: { container: "bg-accent", text: "text-white" },
  secondary: { container: "bg-surface2 border border-border", text: "text-text" },
  ghost: { container: "bg-transparent", text: "text-accent" },
  danger: { container: "bg-lossSoft border border-loss/30", text: "text-loss" },
};

export function Button({
  label,
  variant = "primary",
  loading,
  fullWidth = true,
  disabled,
  className,
  ...props
}: Props & { className?: string }) {
  const styles = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center rounded-2xl py-4 px-5 active:opacity-80",
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50",
        styles.container,
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={cn("font-bodySemi text-base", styles.text)}>{label}</Text>
      )}
    </Pressable>
  );
}
