import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import type { Category, Transaction } from "@/types";
import { displayDate } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { palette } from "@/utils/theme";

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

  return (
    <View style={[styles.item, { borderColor: colors.border }]}>
      <View style={styles.main}>
        <Text style={[styles.category, { color: colors.text }]}>{category?.name ?? "Uncategorized"}</Text>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {transaction.description || "No description"}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>{displayDate(transaction.transactionDate)}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(transaction.amountMinor, transaction.currency)}</Text>
        {(onEdit || onDelete) ? (
          <View style={styles.actions}>
            {onEdit ? <AppButton label="Edit" variant="secondary" icon="create-outline" onPress={onEdit} /> : null}
            {onDelete ? <AppButton label="Delete" variant="danger" icon="trash-outline" onPress={onDelete} /> : null}
          </View>
        ) : null}
      </View>
    </View>
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
    flexWrap: "wrap",
    justifyContent: "flex-end"
  }
});
