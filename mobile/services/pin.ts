import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "manan_wealth_os_unlocked_session";

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}

/** Marks the app unlocked for this OS-level session (cleared on force-quit). */
export async function markUnlocked() {
  await SecureStore.setItemAsync(SESSION_KEY, "1");
}

export async function isUnlocked(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(SESSION_KEY);
  return v === "1";
}

export async function lock() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
