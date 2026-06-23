import { parseISO } from "date-fns";

import type { Budget, CurrencyCode } from "@/types";
import { countWeekdaysAndWeekends, daysInMonth, isWeekendDate, monthKey } from "@/utils/date";

function activeBudgets(budgets: Budget[], currency: CurrencyCode) {
  return budgets.filter((budget) => budget.currency === currency && !budget.categoryId);
}

function findBudget(budgets: Budget[], budgetType: Budget["budgetType"], dayType: Budget["dayType"] = null) {
  return budgets.find((budget) => budget.budgetType === budgetType && budget.dayType === dayType);
}

export function dailyBudgetForDate(budgets: Budget[], currency: CurrencyCode, date = new Date()) {
  const active = activeBudgets(budgets, currency);
  const daySpecific = findBudget(active, "daily", isWeekendDate(date) ? "weekend" : "weekday");
  const daily = findBudget(active, "daily");
  const weekly = findBudget(active, "weekly");
  const monthly = findBudget(active, "monthly");

  if (daySpecific) return daySpecific.amountMinor;
  if (daily) return daily.amountMinor;
  if (weekly) return Math.round(weekly.amountMinor / 7);
  if (monthly) return Math.round(monthly.amountMinor / daysInMonth(date));
  return 0;
}

export function weeklyBudget(budgets: Budget[], currency: CurrencyCode) {
  const active = activeBudgets(budgets, currency);
  const weekly = findBudget(active, "weekly");
  const weekday = findBudget(active, "daily", "weekday");
  const weekend = findBudget(active, "daily", "weekend");
  const daily = findBudget(active, "daily");
  const monthly = findBudget(active, "monthly");

  if (weekly) return weekly.amountMinor;
  if (weekday || weekend) return (weekday?.amountMinor ?? 0) * 5 + (weekend?.amountMinor ?? 0) * 2;
  if (daily) return daily.amountMinor * 7;
  if (monthly) return Math.round(monthly.amountMinor / daysInMonth(new Date()) * 7);
  return 0;
}

export function monthlyBudget(budgets: Budget[], currency: CurrencyCode, month = monthKey()) {
  const active = activeBudgets(budgets, currency);
  const monthly = findBudget(active, "monthly");
  const weekday = findBudget(active, "daily", "weekday");
  const weekend = findBudget(active, "daily", "weekend");
  const weekly = findBudget(active, "weekly");
  const daily = findBudget(active, "daily");
  const counts = countWeekdaysAndWeekends(month);

  if (monthly) return monthly.amountMinor;
  if (weekday || weekend) return (weekday?.amountMinor ?? 0) * counts.weekdays + (weekend?.amountMinor ?? 0) * counts.weekends;
  if (weekly) return Math.round(weekly.amountMinor / 7 * counts.days);
  if (daily) return daily.amountMinor * counts.days;
  return 0;
}

export function budgetStatus(spent: number, budget: number) {
  if (budget <= 0) return "unset";
  const percent = spent / budget;
  if (percent >= 1) return "over";
  if (percent >= 0.8) return "near";
  return "under";
}

export function isFutureDate(isoDate: string) {
  const selected = parseISO(isoDate);
  const today = new Date();
  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return selected > today;
}
