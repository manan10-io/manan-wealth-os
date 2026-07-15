# Running Manan Wealth OS on your Android phone

There are two paths. Start with Path A tonight — it takes five minutes and needs
nothing installed on your phone beyond one app. Move to Path B whenever you want a
real, standalone `.apk` that doesn't need Expo Go at all.

## Path A — Expo Go (fastest, do this first)

**On your phone:**
1. Install **Expo Go** from the Play Store.

**On your computer:**
1. Make sure [Node.js](https://nodejs.org) (LTS) is installed.
2. Unzip this project, then:
   ```bash
   cd manan-wealth-os/mobile
   npm install
   npx expo start
   ```
3. A QR code appears in your terminal.

**Back on your phone:**
1. Make sure your phone is on the **same Wi-Fi network** as your computer.
2. Open Expo Go, tap "Scan QR code," and scan it.
3. The app opens. Onboarding wizard first, then you're in.

Every time you want to open the app again, repeat step 2-3 above (`npx expo start`,
scan). Your data persists between sessions — it's a real file on your phone, not
wiped when you close Expo Go.

## Path B — a real standalone APK (no Expo Go needed)

This produces a proper installable `.apk` you tap to install like any other app,
with your own icon and app name, no Metro server needed afterward.

1. Create a free account at [expo.dev](https://expo.dev) if you don't have one.
2. From `mobile/`:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --platform android --profile preview
   ```
3. This builds in the cloud (free tier, takes ~10-15 min) and gives you a download
   link for the `.apk` when it's done.
4. Download the `.apk` on your phone (or transfer it over), tap it, and allow
   "install from unknown sources" if Android asks. Done — it's a normal app icon on
   your home screen from then on.

## Notes

- The daily 9 PM reminder needs notification permission — Android will prompt for it
  the first time you save a reminder time in Settings. Grant it, or the reminder
  won't fire.
- Your data lives in one file on your phone: `Documents/SQLite/manan-wealth-os.db`
  inside the app's private storage. Use **Settings → Export backup** regularly and
  save the file somewhere durable (it's not automatically backed up anywhere).
- If you ever uninstall the app, its data is gone — restore from your latest backup
  after reinstalling.
