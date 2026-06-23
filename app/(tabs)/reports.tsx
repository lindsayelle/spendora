import { addMonths, format, parseISO, subMonths } from "date-fns";
import { useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { PieChart } from "@/components/PieChart";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TextField } from "@/components/TextField";
import { TransactionItem } from "@/components/TransactionItem";
import { categoryBreakdown, exportMonthlyReport } from "@/features/reports/exportReport";
import { useAppStore } from "@/stores/app-store";
import { displayMonth, monthKey } from "@/utils/date";
import { totalForTransactions } from "@/utils/insights";
import { formatMoney } from "@/utils/money";
import { palette } from "@/utils/theme";

function transactionsForMonth(month: string, transactions: ReturnType<typeof useAppStore.getState>["transactions"]) {
  return transactions.filter((transaction) => transaction.transactionDate.startsWith(month));
}

export default function ReportsScreen() {
  const colors = palette(useColorScheme());
  const ready = useAppStore((state) => state.ready);
  const settings = useAppStore((state) => state.settings);
  const categories = useAppStore((state) => state.categories);
  const transactions = useAppStore((state) => state.transactions);
  const [month, setMonth] = useState(monthKey());

  const currentTransactions = useMemo(() => transactionsForMonth(month, transactions), [month, transactions]);
  const previousMonth = format(subMonths(parseISO(`${month}-01`), 1), "yyyy-MM");
  const previousTransactions = useMemo(() => transactionsForMonth(previousMonth, transactions), [previousMonth, transactions]);

  if (!ready || !settings) return <LoadingState />;

  const total = totalForTransactions(currentTransactions);
  const previousTotal = totalForTransactions(previousTransactions);
  const difference = previousTotal ? Math.round((total - previousTotal) / previousTotal * 100) : 0;
  const comparison = previousTotal === 0
    ? "No previous month data yet"
    : `${Math.abs(difference)}% ${difference >= 0 ? "higher" : "lower"} than last month`;
  const slices = categoryBreakdown(currentTransactions, categories);

  return (
    <Screen title="Reports" subtitle="Monthly totals, category mix, transaction detail, and PDF export.">
      <Card style={styles.block}>
        <SectionTitle>Month</SectionTitle>
        <View style={styles.monthRow}>
          <AppButton label="Previous" variant="secondary" icon="chevron-back-outline" onPress={() => setMonth(format(subMonths(parseISO(`${month}-01`), 1), "yyyy-MM"))} />
          <TextField label="Selected Month" value={month} onChangeText={setMonth} placeholder="2026-06" />
          <AppButton label="Next" variant="secondary" icon="chevron-forward-outline" onPress={() => setMonth(format(addMonths(parseISO(`${month}-01`), 1), "yyyy-MM"))} />
        </View>
      </Card>

      <Card style={styles.block}>
        <Text style={[styles.monthTitle, { color: colors.muted }]}>{displayMonth(month)}</Text>
        <Text style={[styles.total, { color: colors.text }]}>{formatMoney(total, settings.mainCurrency)}</Text>
        <Text style={[styles.comparison, { color: previousTotal && difference > 0 ? colors.warning : colors.success }]}>{comparison}</Text>
        <View style={styles.export}>
          <AppButton
            label="Export PDF"
            icon="download-outline"
            onPress={() => exportMonthlyReport({ month, currency: settings.mainCurrency, transactions: currentTransactions, categories, comparison })}
          />
        </View>
      </Card>

      <Card style={styles.block}>
        <SectionTitle>Category Breakdown</SectionTitle>
        <PieChart slices={slices} currency={settings.mainCurrency} />
      </Card>

      <Card>
        <SectionTitle>Transactions</SectionTitle>
        {currentTransactions.length ? (
          currentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} categories={categories} />
          ))
        ) : (
          <Text style={[styles.empty, { color: colors.muted }]}>No transactions for this month yet.</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 12
  },
  monthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 10
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  total: {
    fontSize: 36,
    fontWeight: "900",
    marginTop: 6
  },
  comparison: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4
  },
  export: {
    alignItems: "flex-start",
    marginTop: 16
  },
  empty: {
    paddingVertical: 18
  }
});
