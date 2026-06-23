import { StyleSheet, View, useColorScheme } from "react-native";

import { palette } from "@/utils/theme";

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const colors = palette(useColorScheme());
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  }
});
