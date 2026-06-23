import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TransactionForm } from "@/components/TransactionForm";
import { useAppStore } from "@/stores/app-store";
import { dashboardMetrics, spendingInsight } from "@/utils/insights";
import { formatMoney } from "@/utils/money";
import { palette } from "@/utils/theme";

function MetricCard({ label, spent, budget, left }: { label: string; spent: string; budget?: string; left?: string }) {
  const colors = palette(useColorScheme());
  return (
    <Card style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{spent}</Text>
      {budget ? <Text style={[styles.metricSub, { color: colors.muted }]}>of {budget}</Text> : null}
      {left ? <Text style={[styles.left, { color: colors.success }]}>{left} left</Text> : null}
    </Card>
  );
}

export default function HomeScreen() {
  const colors = palette(useColorScheme());
  const ready = useAppStore((state) => state.ready);
  const settings = useAppStore((state) => state.settings);
  const categories = useAppStore((state) => state.categories);
  const transactions = useAppStore((state) => state.transactions);
  const budgets = useAppStore((state) => state.budgets);
  const saveTransaction = useAppStore((state) => state.saveTransaction);

  if (!ready || !settings) return <LoadingState />;

  const metrics = dashboardMetrics(transactions, budgets, settings.mainCurrency);
  const insight = spendingInsight(transactions, categories, budgets, settings.mainCurrency);

  return (
    <Screen title="Spendora" subtitle="Routine-aware spending, stored locally on this device.">
      <View style={styles.metrics}>
        <MetricCard
          label="Today"
          spent={formatMoney(metrics.todaySpent, settings.mainCurrency)}
          budget={metrics.todayBudget ? formatMoney(metrics.todayBudget, settings.mainCurrency) : "No budget set"}
          left={metrics.todayBudget ? formatMoney(metrics.todayLeft, settings.mainCurrency) : undefined}
        />
        <MetricCard
          label="This Week"
          spent={formatMoney(metrics.weekSpent, settings.mainCurrency)}
          budget={metrics.weekBudget ? formatMoney(metrics.weekBudget, settings.mainCurrency) : "No budget set"}
          left={metrics.weekBudget ? formatMoney(metrics.weekLeft, settings.mainCurrency) : undefined}
        />
        <MetricCard
          label="This Month"
          spent={formatMoney(metrics.monthSpent, settings.mainCurrency)}
          budget={metrics.monthBudget ? formatMoney(metrics.monthBudget, settings.mainCurrency) : "No budget set"}
          left={metrics.monthBudget ? formatMoney(metrics.monthLeft, settings.mainCurrency) : undefined}
        />
      </View>

      <Card style={styles.block}>
        <SectionTitle>Insight</SectionTitle>
        <Text style={[styles.insight, { color: colors.text }]}>{insight}</Text>
        <Text style={[styles.prediction, { color: colors.muted }]}>
          Current pace: {formatMoney(metrics.weeklyPrediction, settings.mainCurrency)} this week and{" "}
          {formatMoney(metrics.monthlyPrediction, settings.mainCurrency)} this month.
        </Text>
      </Card>

      <Card style={styles.block}>
        <SectionTitle>Quick Add</SectionTitle>
        <TransactionForm
          categories={categories}
          currency={settings.mainCurrency}
          buttonLabel="Add Spending"
          onSubmit={saveTransaction}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12
  },
  metric: {
    flex: 1,
    minWidth: 220
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8
  },
  metricSub: {
    fontSize: 14,
    marginTop: 4
  },
  left: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "800"
  },
  block: {
    marginBottom: 12
  },
  insight: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700"
  },
  prediction: {
    marginTop: 8,
    lineHeight: 20
  }
});
