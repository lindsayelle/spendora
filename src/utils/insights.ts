import { parseISO } from "date-fns";

import type { Budget, Category, CurrencyCode, Transaction } from "@/types";
import { currentRanges, daysElapsedInMonth, daysElapsedInWeek, isInIntervalDate, isISODateToday, isWeekendDate, monthKey } from "@/utils/date";
import { dailyBudgetForDate, monthlyBudget, weeklyBudget } from "@/utils/budget";
import { formatMoney } from "@/utils/money";

export function totalForTransactions(transactions: Transaction[]) {
  return transactions.reduce((sum, transaction) => sum + transaction.amountMinor, 0);
}

export function categoryName(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Uncategorized";
}

export function topCategory(transactions: Transaction[], categories: Category[]) {
  const totals = new Map<string, number>();
  transactions.forEach((transaction) => {
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amountMinor);
  });
  const [categoryId] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  return categoryId ? categoryName(categories, categoryId) : null;
}

export function dashboardMetrics(transactions: Transaction[], budgets: Budget[], currency: CurrencyCode, now = new Date()) {
  const ranges = currentRanges(now);
  const todayTransactions = transactions.filter((transaction) => isISODateToday(transaction.transactionDate));
  const weekTransactions = transactions.filter((transaction) => isInIntervalDate(transaction.transactionDate, ranges.week.start, ranges.week.end));
  const monthTransactions = transactions.filter((transaction) => isInIntervalDate(transaction.transactionDate, ranges.month.start, ranges.month.end));
  const todaySpent = totalForTransactions(todayTransactions);
  const weekSpent = totalForTransactions(weekTransactions);
  const monthSpent = totalForTransactions(monthTransactions);
  const todayBudget = dailyBudgetForDate(budgets, currency, now);
  const weekBudget = weeklyBudget(budgets, currency);
  const monthBudget = monthlyBudget(budgets, currency, monthKey(now));

  return {
    todayTransactions,
    weekTransactions,
    monthTransactions,
    todaySpent,
    weekSpent,
    monthSpent,
    todayBudget,
    weekBudget,
    monthBudget,
    todayLeft: Math.max(todayBudget - todaySpent, 0),
    weekLeft: Math.max(weekBudget - weekSpent, 0),
    monthLeft: Math.max(monthBudget - monthSpent, 0),
    weeklyPrediction: daysElapsedInWeek(now) ? Math.round(weekSpent / daysElapsedInWeek(now) * 7) : weekSpent,
    monthlyPrediction: daysElapsedInMonth(now) ? Math.round(monthSpent / daysElapsedInMonth(now) * Number(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())) : monthSpent
  };
}

export function spendingInsight(transactions: Transaction[], categories: Category[], budgets: Budget[], currency: CurrencyCode) {
  const metrics = dashboardMetrics(transactions, budgets, currency);
  const todayTop = topCategory(metrics.todayTransactions, categories);
  const historical = transactions.filter((transaction) => !isISODateToday(transaction.transactionDate));

  if (historical.length < 5) {
    if (metrics.todayBudget > 0 && metrics.todaySpent > metrics.todayBudget) {
      return `You are over today's budget by ${formatMoney(metrics.todaySpent - metrics.todayBudget, currency)}.`;
    }
    return "Not enough history yet. Spendora will show routine-based insights after more transactions are added.";
  }

  if (metrics.todayBudget > 0) {
    const percent = metrics.todaySpent / metrics.todayBudget;
    if (percent >= 1) return `You are over today's budget by ${formatMoney(metrics.todaySpent - metrics.todayBudget, currency)}.`;
    if (percent >= 0.8) return `You have used ${Math.round(percent * 100)}% of today's budget.`;
  }

  if (metrics.weekBudget > 0 && metrics.weeklyPrediction > metrics.weekBudget) {
    return `At your current pace, you may exceed your weekly budget by Sunday.`;
  }

  if (todayTop) return `${todayTop} is your highest category today.`;

  const weekdayTotals = historical.filter((transaction) => !isWeekendDate(parseISO(transaction.transactionDate)));
  const weekendTotals = historical.filter((transaction) => isWeekendDate(parseISO(transaction.transactionDate)));
  const basis = isWeekendDate(new Date()) ? weekendTotals : weekdayTotals;
  const average = basis.length ? totalForTransactions(basis) / basis.length : 0;

  if (average > 0 && metrics.todaySpent > average * 1.5) {
    return `You have spent more than usual for this ${isWeekendDate(new Date()) ? "weekend" : "weekday"}.`;
  }

  return "You are within your usual spending range today.";
}
