import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

import { palette } from "@/utils/theme";

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const colors = palette(useColorScheme());
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.tint : colors.surfaceAlt,
          borderColor: selected ? colors.tint : colors.border
        }
      ]}
    >
      <Text style={[styles.label, { color: selected ? "#FFFFFF" : colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 14,
    fontWeight: "700"
  }
});
