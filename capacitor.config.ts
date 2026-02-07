import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lumea.app",
  appName: "Lumea",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
