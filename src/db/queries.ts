import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

import type { AppData, Budget, Category, CurrencyCode, Settings, Transaction } from "@/types";
import { makeId } from "@/utils/ids";
import { schemaSql } from "@/db/schema";

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

type SQLiteDatabase = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

let dbPromise: Promise<SQLiteDatabase> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function initialSettings(): Settings {
  const now = nowIso();
  return { id: settingsId, mainCurrency: "CNY", createdAt: now, updatedAt: now };
}

function defaultCategories(): Category[] {
  const now = nowIso();
  return defaultCategoryNames.map((name) => ({
    id: `default_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    parentCategoryId: null,
    isDefault: true,
    createdAt: now,
    updatedAt: now
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

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("spendora.db");
  return dbPromise;
}

function getLocalData(): AppData {
  if (typeof window === "undefined" || !window.localStorage) return emptyData();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return emptyData();
  const parsed = JSON.parse(raw) as AppData;
  return {
    settings: parsed.settings ?? initialSettings(),
    categories: parsed.categories?.length ? parsed.categories : defaultCategories(),
    transactions: parsed.transactions ?? [],
    budgets: parsed.budgets ?? []
  };
}

function setLocalData(data: AppData) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

function rowToSettings(row: Record<string, unknown>): Settings {
  return {
    id: String(row.id),
    mainCurrency: String(row.main_currency) as CurrencyCode,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    parentCategoryId: row.parent_category_id ? String(row.parent_category_id) : null,
    isDefault: Number(row.is_default) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    amountMinor: Number(row.amount_minor),
    currency: String(row.currency) as CurrencyCode,
    description: row.description ? String(row.description) : "",
    categoryId: String(row.category_id),
    transactionDate: String(row.transaction_date),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function rowToBudget(row: Record<string, unknown>): Budget {
  return {
    id: String(row.id),
    budgetType: String(row.budget_type) as Budget["budgetType"],
    amountMinor: Number(row.amount_minor),
    currency: String(row.currency) as CurrencyCode,
    dayType: row.day_type ? (String(row.day_type) as Budget["dayType"]) : null,
    categoryId: row.category_id ? String(row.category_id) : null,
    startDate: String(row.start_date),
    endDate: row.end_date ? String(row.end_date) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function initializeStorage() {
  if (Platform.OS === "web") {
    const data = getLocalData();
    setLocalData(data);
    return data;
  }

  const db = await getDb();
  await db.execAsync(schemaSql);
  const settings = initialSettings();
  await db.runAsync(
    "INSERT OR IGNORE INTO settings (id, main_currency, created_at, updated_at) VALUES (?, ?, ?, ?)",
    settings.id,
    settings.mainCurrency,
    settings.createdAt,
    settings.updatedAt
  );

  for (const category of defaultCategories()) {
    await db.runAsync(
      "INSERT OR IGNORE INTO categories (id, name, parent_category_id, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      category.id,
      category.name,
      category.parentCategoryId,
      category.isDefault ? 1 : 0,
      category.createdAt,
      category.updatedAt
    );
  }

  return loadData();
}

export async function loadData(): Promise<AppData> {
  if (Platform.OS === "web") return getLocalData();

  const db = await getDb();
  const settingsRows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM settings LIMIT 1");
  const categoryRows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM categories ORDER BY is_default DESC, name ASC");
  const transactionRows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC");
  const budgetRows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM budgets ORDER BY budget_type ASC, day_type ASC");

  return {
    settings: settingsRows[0] ? rowToSettings(settingsRows[0]) : initialSettings(),
    categories: categoryRows.map(rowToCategory),
    transactions: transactionRows.map(rowToTransaction),
    budgets: budgetRows.map(rowToBudget)
  };
}

export async function saveSettings(settings: Settings) {
  const next = { ...settings, updatedAt: nowIso() };
  if (Platform.OS === "web") {
    const data = getLocalData();
    setLocalData({ ...data, settings: next });
    return next;
  }

  const db = await getDb();
  await db.runAsync(
    "UPDATE settings SET main_currency = ?, updated_at = ? WHERE id = ?",
    next.mainCurrency,
    next.updatedAt,
    next.id
  );
  return next;
}

export async function upsertCategory(category: Partial<Category> & Pick<Category, "name">) {
  const existing = category.id ? getLocalData().categories.find((item) => item.id === category.id) : null;
  const now = nowIso();
  const next: Category = {
    id: category.id ?? makeId("cat"),
    name: category.name.trim(),
    parentCategoryId: category.parentCategoryId ?? null,
    isDefault: category.isDefault ?? false,
    createdAt: category.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now
  };

  if (Platform.OS === "web") {
    const data = getLocalData();
    const categories = data.categories.some((item) => item.id === next.id)
      ? data.categories.map((item) => (item.id === next.id ? next : item))
      : [...data.categories, next];
    setLocalData({ ...data, categories });
    return next;
  }

  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO categories (id, name, parent_category_id, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    next.id,
    next.name,
    next.parentCategoryId,
    next.isDefault ? 1 : 0,
    next.createdAt,
    next.updatedAt
  );
  return next;
}

export async function deleteCategory(categoryId: string) {
  if (Platform.OS === "web") {
    const data = getLocalData();
    setLocalData({ ...data, categories: data.categories.filter((category) => category.id !== categoryId) });
    return;
  }

  const db = await getDb();
  await db.runAsync("DELETE FROM categories WHERE id = ?", categoryId);
}

export async function upsertTransaction(transaction: Omit<Transaction, "createdAt" | "updatedAt"> & Partial<Pick<Transaction, "createdAt" | "updatedAt">>) {
  const now = nowIso();
  const next: Transaction = {
    ...transaction,
    createdAt: transaction.createdAt ?? now,
    updatedAt: now
  };

  if (Platform.OS === "web") {
    const data = getLocalData();
    const transactions = data.transactions.some((item) => item.id === next.id)
      ? data.transactions.map((item) => (item.id === next.id ? next : item))
      : [next, ...data.transactions];
    setLocalData({ ...data, transactions });
    return next;
  }

  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO transactions (id, amount_minor, currency, description, category_id, transaction_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    next.id,
    next.amountMinor,
    next.currency,
    next.description,
    next.categoryId,
    next.transactionDate,
    next.createdAt,
    next.updatedAt
  );
  return next;
}

export async function deleteTransaction(transactionId: string) {
  if (Platform.OS === "web") {
    const data = getLocalData();
    setLocalData({ ...data, transactions: data.transactions.filter((transaction) => transaction.id !== transactionId) });
    return;
  }

  const db = await getDb();
  await db.runAsync("DELETE FROM transactions WHERE id = ?", transactionId);
}

export async function upsertBudget(budget: Omit<Budget, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Budget, "id" | "createdAt" | "updatedAt">>) {
  const now = nowIso();
  const next: Budget = {
    ...budget,
    id: budget.id ?? makeId("budget"),
    createdAt: budget.createdAt ?? now,
    updatedAt: now
  };

  if (Platform.OS === "web") {
    const data = getLocalData();
    const budgets = data.budgets.some((item) => item.id === next.id)
      ? data.budgets.map((item) => (item.id === next.id ? next : item))
      : [...data.budgets, next];
    setLocalData({ ...data, budgets });
    return next;
  }

  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO budgets (id, budget_type, amount_minor, currency, day_type, category_id, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    next.id,
    next.budgetType,
    next.amountMinor,
    next.currency,
    next.dayType,
    next.categoryId,
    next.startDate,
    next.endDate,
    next.createdAt,
    next.updatedAt
  );
  return next;
}

export async function removeBudget(budgetId: string) {
  if (Platform.OS === "web") {
    const data = getLocalData();
    setLocalData({ ...data, budgets: data.budgets.filter((budget) => budget.id !== budgetId) });
    return;
  }

  const db = await getDb();
  await db.runAsync("DELETE FROM budgets WHERE id = ?", budgetId);
}
