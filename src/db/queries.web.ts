import type { AppData, Budget, Category, CurrencyCode, Settings, Transaction } from "@/types";
import { makeId } from "@/utils/ids";
import { categoryColors } from "@/utils/theme";

const storageKey = "spendora.v1";
const settingsId = "settings_main";

const defaultCategoryNames = [
  "Dine Out",
  "Transportation",
  "Health Care",
  "Subscriptions",
  "Groceries",
  "Clothing",
  "Travel",
  "Entertainment",
  "Household",
  "Personal Care"
];

function nowIso() {
  return new Date().toISOString();
}

function initialSettings(): Settings {
  const now = nowIso();
  return { id: settingsId, mainCurrency: "CNY", createdAt: now, updatedAt: now };
}

function defaultCategories(): Category[] {
  const now = nowIso();
  return defaultCategoryNames.map((name, index) => ({
    id: `default_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    parentCategoryId: null,
    isDefault: true,
    color: categoryColors[index % categoryColors.length],
    createdAt: now,
    updatedAt: now
  }));
}

function normalizeCategories(categories: Category[]) {
  return categories.map((category, index) => ({
    ...category,
    color: category.color ?? categoryColors[index % categoryColors.length]
  }));
}

function emptyData(): AppData {
  return {
    settings: initialSettings(),
    categories: defaultCategories(),
    transactions: [],
    budgets: []
  };
}

function getLocalData(): AppData {
  if (typeof window === "undefined" || !window.localStorage) return emptyData();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return emptyData();
  const parsed = JSON.parse(raw) as AppData;
  return {
    settings: parsed.settings ?? initialSettings(),
    categories: parsed.categories?.length ? normalizeCategories(parsed.categories) : defaultCategories(),
    transactions: parsed.transactions ?? [],
    budgets: parsed.budgets ?? []
  };
}

function setLocalData(data: AppData) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function initializeStorage() {
  const data = getLocalData();
  setLocalData(data);
  return data;
}

export async function loadData(): Promise<AppData> {
  return getLocalData();
}

export async function saveSettings(settings: Settings) {
  const next = { ...settings, updatedAt: nowIso() };
  const data = getLocalData();
  setLocalData({ ...data, settings: next });
  return next;
}

export async function upsertCategory(category: Partial<Category> & Pick<Category, "name">) {
  const data = getLocalData();
  const existing = category.id ? data.categories.find((item) => item.id === category.id) : null;
  const now = nowIso();
  const next: Category = {
    id: category.id ?? makeId("cat"),
    name: category.name.trim(),
    parentCategoryId: category.parentCategoryId ?? null,
    isDefault: category.isDefault ?? false,
    color: category.color ?? existing?.color ?? categoryColors[0],
    createdAt: category.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now
  };
  const categories = data.categories.some((item) => item.id === next.id)
    ? data.categories.map((item) => (item.id === next.id ? next : item))
    : [...data.categories, next];
  setLocalData({ ...data, categories });
  return next;
}

export async function deleteCategory(categoryId: string) {
  const data = getLocalData();
  setLocalData({ ...data, categories: data.categories.filter((category) => category.id !== categoryId) });
}

export async function upsertTransaction(transaction: Omit<Transaction, "createdAt" | "updatedAt"> & Partial<Pick<Transaction, "createdAt" | "updatedAt">>) {
  const data = getLocalData();
  const now = nowIso();
  const next: Transaction = {
    ...transaction,
    createdAt: transaction.createdAt ?? now,
    updatedAt: now
  };
  const transactions = data.transactions.some((item) => item.id === next.id)
    ? data.transactions.map((item) => (item.id === next.id ? next : item))
    : [next, ...data.transactions];
  setLocalData({ ...data, transactions });
  return next;
}

export async function deleteTransaction(transactionId: string) {
  const data = getLocalData();
  setLocalData({ ...data, transactions: data.transactions.filter((transaction) => transaction.id !== transactionId) });
}

export async function upsertBudget(budget: Omit<Budget, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Budget, "id" | "createdAt" | "updatedAt">>) {
  const data = getLocalData();
  const now = nowIso();
  const next: Budget = {
    ...budget,
    id: budget.id ?? makeId("budget"),
    createdAt: budget.createdAt ?? now,
    updatedAt: now
  };
  const budgets = data.budgets.some((item) => item.id === next.id)
    ? data.budgets.map((item) => (item.id === next.id ? next : item))
    : [...data.budgets, next];
  setLocalData({ ...data, budgets });
  return next;
}

export async function removeBudget(budgetId: string) {
  const data = getLocalData();
  setLocalData({ ...data, budgets: data.budgets.filter((budget) => budget.id !== budgetId) });
}
