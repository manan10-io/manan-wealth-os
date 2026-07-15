import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type ExpenseCategory = {
  key: string;
  label: string;
  icon: IoniconName;
  color: string;
};

// The six quick-add buttons requested for the 9 PM prompt, plus a few
// extras available from the full "Add expense" screen.
export const QUICK_ADD_CATEGORIES: ExpenseCategory[] = [
  { key: "food", label: "Food", icon: "fast-food-outline", color: "#E8B65A" },
  { key: "fuel", label: "Fuel", icon: "flame-outline", color: "#FF6B6B" },
  { key: "shopping", label: "Shopping", icon: "bag-handle-outline", color: "#5B6CFF" },
  { key: "bills", label: "Bills", icon: "receipt-outline", color: "#33C481" },
  { key: "travel", label: "Travel", icon: "airplane-outline", color: "#4FC3F7" },
  { key: "others", label: "Others", icon: "ellipsis-horizontal-circle-outline", color: "#8B93A3" },
];

export const ALL_CATEGORIES: ExpenseCategory[] = [
  ...QUICK_ADD_CATEGORIES,
  { key: "coffee", label: "Coffee", icon: "cafe-outline", color: "#C58940" },
  { key: "rent", label: "Rent", icon: "home-outline", color: "#9B7BFF" },
  { key: "subscriptions", label: "Subscriptions", icon: "sync-outline", color: "#FF8FB1" },
  { key: "health", label: "Health", icon: "medkit-outline", color: "#FF6B6B" },
  { key: "groceries", label: "Groceries", icon: "cart-outline", color: "#33C481" },
];

export const PAYMENT_METHODS = ["UPI", "Cash", "Card", "Net Banking"] as const;

export function categoryByKey(key: string): ExpenseCategory {
  return (
    ALL_CATEGORIES.find((c) => c.key === key) ?? {
      key,
      label: key,
      icon: "pricetag-outline",
      color: "#8B93A3",
    }
  );
}
