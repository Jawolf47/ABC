import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.alphabearclub.app",
  appName: "Alpha Bear Club",
  webDir: "out",
  server: {
    url: "https://alpha-bear-club.vercel.app",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
}

export default config
