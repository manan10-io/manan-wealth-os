import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import CryptoJS from "crypto-js";

const DB_PATH = `${FileSystem.documentDirectory}SQLite/manan-wealth-os.db`;

export async function exportDatabase(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (!info.exists) throw new Error("Database file not found yet — add at least one entry first.");

  const dest = `${FileSystem.cacheDirectory}manan-wealth-os-backup-${Date.now()}.db`;
  await FileSystem.copyAsync({ from: DB_PATH, to: dest });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest, {
      mimeType: "application/x-sqlite3",
      dialogTitle: "Save your Manan Wealth OS backup",
    });
  }
}

/**
 * Copies a previously-exported .db file back over the live database.
 * Restart the app afterwards for the restored data to load — the running
 * SQLite connection has to be reopened from a fresh process.
 */
export async function importDatabase(): Promise<boolean> {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/x-sqlite3", copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return false;

  await FileSystem.copyAsync({ from: result.assets[0].uri, to: DB_PATH });
  return true;
}

/**
 * Password-encrypted backup. The database is read as base64 (binary-safe),
 * AES-encrypted on-device with your password, and written out as a
 * `.mwobackup` file — unreadable to anyone (including you) without the
 * password. There's no password recovery: if you forget it, that backup is
 * gone, by design — there's no server to reset it from.
 */
export async function exportEncryptedDatabase(password: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (!info.exists) throw new Error("Database file not found yet — add at least one entry first.");
  if (!password) throw new Error("Enter a password to encrypt the backup.");

  const base64 = await FileSystem.readAsStringAsync(DB_PATH, { encoding: FileSystem.EncodingType.Base64 });
  const encrypted = CryptoJS.AES.encrypt(base64, password).toString();

  const dest = `${FileSystem.cacheDirectory}manan-wealth-os-backup-${Date.now()}.mwobackup`;
  await FileSystem.writeAsStringAsync(dest, encrypted, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest, { dialogTitle: "Save your encrypted Manan Wealth OS backup" });
  }
}

/** Restores a `.mwobackup` file created by exportEncryptedDatabase. Restart the app after. */
export async function importEncryptedDatabase(password: string): Promise<boolean> {
  if (!password) throw new Error("Enter the password this backup was encrypted with.");
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return false;

  const encrypted = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
  let base64: string;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, password);
    base64 = bytes.toString(CryptoJS.enc.Utf8);
    if (!base64) throw new Error("empty");
  } catch {
    throw new Error("Wrong password, or this isn't a Manan Wealth OS encrypted backup.");
  }

  await FileSystem.writeAsStringAsync(DB_PATH, base64, { encoding: FileSystem.EncodingType.Base64 });
  return true;
}

export function getDatabasePath(): string {
  return DB_PATH;
}
