import { StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { palette } from "@/utils/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad" | "numeric";
  maxLength?: number;
};

export function TextField({ label, value, onChangeText, placeholder, keyboardType, maxLength }: Props) {
  const colors = palette(useColorScheme());

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    flex: 1,
    minWidth: 160
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 16
  }
});
