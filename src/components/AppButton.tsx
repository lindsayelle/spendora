import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

import { palette } from "@/utils/theme";

type Props = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export function AppButton({ label, onPress, icon, variant = "primary", disabled }: Props) {
  const colors = palette(useColorScheme());
  const background = variant === "primary" ? colors.tint : variant === "danger" ? colors.danger : colors.surfaceAlt;
  const color = variant === "secondary" ? colors.text : "#FFFFFF";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.82 : 1 }
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  label: {
    fontSize: 15,
    fontWeight: "700"
  }
});
