import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import type { Category, Transaction } from "@/types";
import { displayDate } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { categoryColors, palette } from "@/utils/theme";

export function TransactionItem({
  transaction,
  categories,
  onEdit,
  onDelete
}: {
  transaction: Transaction;
  categories: Category[];
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const colors = palette(useColorScheme());
  const category = categories.find((item) => item.id === transaction.categoryId);
  const categoryColor = category?.color ?? categoryColors[0];

  return (
    <View style={[styles.item, { borderColor: colors.border }]}> 
      <View style={styles.main}>
        <View style={styles.categoryLine}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <Text style={[styles.category, { color: colors.text }]}>{category?.name ?? "Uncategorized"}</Text>
        </View>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {transaction.description || "No description"}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>{displayDate(transaction.transactionDate)}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(transaction.amountMinor, transaction.currency)}</Text>
        {(onEdit || onDelete) ? (
          <View style={styles.actions}>
            {onEdit ? <IconAction icon="create-outline" label="Edit transaction" color={colors.tint} onPress={onEdit} /> : null}
            {onDelete ? <IconAction icon="trash-outline" label="Delete transaction" color={colors.danger} onPress={onDelete} /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function IconAction({ icon, label, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void }) {
  const colors = palette(useColorScheme());
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.iconButton,
        {
          backgroundColor: pressed ? color : hovered ? colors.surfaceAlt : "transparent",
          borderColor: pressed || hovered ? color : colors.border,
          transform: [{ scale: pressed ? 1.18 : hovered ? 1.1 : 1 }]
        }
      ]}
    >
      {({ pressed, hovered }) => <Ionicons name={icon} size={20} color={pressed ? "#FFFFFF" : hovered ? color : colors.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  main: {
    flex: 1,
    minWidth: 0
  },
  categoryLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  category: {
    fontSize: 16,
    fontWeight: "800"
  },
  description: {
    marginTop: 3,
    fontSize: 14
  },
  date: {
    marginTop: 5,
    fontSize: 13
  },
  side: {
    alignItems: "flex-end",
    gap: 8,
    maxWidth: 230
  },
  amount: {
    fontSize: 18,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end"
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center"
  }
});
