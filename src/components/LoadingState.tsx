import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";

import { palette } from "@/utils/theme";

export function LoadingState({ message = "Loading Spendora" }: { message?: string }) {
  const colors = palette(useColorScheme());
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.tint} />
      <Text style={{ color: colors.muted }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  }
});
