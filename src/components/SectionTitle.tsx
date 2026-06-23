import { StyleSheet, Text, useColorScheme } from "react-native";

import { palette } from "@/utils/theme";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const colors = palette(useColorScheme());
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10
  }
});
