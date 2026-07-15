/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base surfaces — ink, not pure black
        ink: "#0B0D12",
        surface: "#14171F",
        surface2: "#1B1F2A",
        border: "#262B38",
        // Text
        text: "#F2F3F6",
        muted: "#8B93A3",
        faint: "#5B6270",
        // Brand accent — indigo, reads as "trust + growth", not the default AI purple/violet
        accent: "#5B6CFF",
        accentSoft: "#252A55",
        // Semantic money colors
        gain: "#33C481",
        gainSoft: "#122A21",
        loss: "#FF6B6B",
        lossSoft: "#2B1518",
        gold: "#E8B65A",
      },
      fontFamily: {
        display: ["Sora_600SemiBold"],
        displayBold: ["Sora_700Bold"],
        body: ["Inter_400Regular"],
        bodyMedium: ["Inter_500Medium"],
        bodySemi: ["Inter_600SemiBold"],
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};
