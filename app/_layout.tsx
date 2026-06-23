import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";

import { AppProvider } from "@/stores/app-store";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AppProvider>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
