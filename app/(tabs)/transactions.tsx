import { useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { DatePickerField } from "@/components/DatePickerField";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionItem } from "@/components/TransactionItem";
import { useAppStore } from "@/stores/app-store";
import type { Transaction } from "@/types";
import { isDateInRange, todayISO } from "@/utils/date";
import { totalForTransactions } from "@/utils/insights";
import { formatMoney } from "@/utils/money";
import { palette } from "@/utils/theme";

export default function TransactionsScreen() {
  const colors = palette(useColorScheme());
  const ready = useAppStore((state) => state.ready);
  const settings = useAppStore((state) => state.settings);
  const categories = useAppStore((state) => state.categories);
  const transactions = useAppStore((state) => state.transactions);
  const saveTransaction = useAppStore((state) => state.saveTransaction);
  const deleteTransaction = useAppStore((state) => state.deleteTransaction);
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [categoryId, setCategoryId] = useState("all");
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const dateMatch = isDateInRange(transaction.transactionDate, from, to);
      const categoryMatch = categoryId === "all" || transaction.categoryId === categoryId;
      return dateMatch && categoryMatch;
    });
  }, [transactions, from, to, categoryId]);

  const filteredTotal = totalForTransactions(filtered);

  if (!ready || !settings) return <LoadingState />;

  return (
    <Screen title="Transactions" subtitle="Add, edit, delete, and filter local spending records.">
      <Card style={styles.block}>
        <SectionTitle>{editing ? "Edit Spending" : "Add Spending"}</SectionTitle>
        <TransactionForm
          categories={categories}
          currency={settings.mainCurrency}
          initial={editing}
          buttonLabel={editing ? "Update Spending" : "Add Spending"}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={async (values) => {
            await saveTransaction(values);
            setEditing(null);
          }}
        />
      </Card>

      <Card style={styles.block}>
        <SectionTitle>Filters</SectionTitle>
        <View style={styles.filterRow}>
          <DatePickerField label="From" value={from} onChange={setFrom} />
          <DatePickerField label="To" value={to} onChange={setTo} />
        </View>
        <View style={styles.chips}>
          <Chip label="All" selected={categoryId === "all"} onPress={() => setCategoryId("all")} />
          {categories.map((category) => (
            <Chip key={category.id} label={category.name} selected={categoryId === category.id} onPress={() => setCategoryId(category.id)} />
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.historyHeader}>
          <SectionTitle>History</SectionTitle>
          <View style={styles.filteredTotal}>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>Filtered total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatMoney(filteredTotal, settings.mainCurrency)}</Text>
          </View>
        </View>
        {filtered.length ? (
          filtered.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              onEdit={() => setEditing(transaction)}
              onDelete={() => deleteTransaction(transaction.id)}
            />
          ))
        ) : (
          <Text style={[styles.empty, { color: colors.muted }]}>No spending added today yet.</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 12
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap"
  },
  filteredTotal: {
    alignItems: "flex-end",
    marginBottom: 10
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900"
  },
  empty: {
    paddingVertical: 18,
    fontSize: 15
  }
});
