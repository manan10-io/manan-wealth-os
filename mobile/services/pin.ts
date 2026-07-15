import * as Crypto from "expo-crypto";

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}

/**
 * Unlock state is deliberately in-memory only: a cold start always lands on
 * the PIN screen. (It used to live in SecureStore, but SecureStore persists
 * across restarts, which meant the PIN was asked exactly once, ever.)
 */
let unlockedThisSession = false;

export async function markUnlocked() {
  unlockedThisSession = true;
}

export async function isUnlocked(): Promise<boolean> {
  return unlockedThisSession;
}

export async function lock() {
  unlockedThisSession = false;
}
