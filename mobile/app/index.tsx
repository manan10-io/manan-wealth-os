import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const profile = useAppStore((s) => s.profile);
  const unlocked = useAppStore((s) => s.unlocked);

  if (!profile || !profile.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }
  if (!unlocked) {
    return <Redirect href="/pin-lock" />;
  }
  return <Redirect href="/(app)/(tabs)/dashboard" />;
}
