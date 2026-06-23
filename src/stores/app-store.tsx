import { useEffect, type ReactNode } from "react";
import { create } from "zustand";

import type { Budget, Category, CurrencyCode, Settings, Transaction } from "@/types";
import {
  deleteCategory as dbDeleteCategory,
  deleteTransaction as dbDeleteTransaction,
  initializeStorage,
  loadData,
  removeBudget as dbRemoveBudget,
  saveSettings,
  upsertBudget as dbUpsertBudget,
  upsertCategory as dbUpsertCategory,
  upsertTransaction as dbUpsertTransaction
} from "@/db/queries";

type StoreState = {
  ready: boolean;
  error: string | null;
  settings: Settings | null;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  init: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  saveTransaction: (transaction: Omit<Transaction, "createdAt" | "updatedAt"> & Partial<Pick<Transaction, "createdAt" | "updatedAt">>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  saveBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Budget, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeBudget: (budgetId: string) => Promise<void>;
  saveCategory: (category: Partial<Category> & Pick<Category, "name">) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
};

async function refresh(set: (partial: Partial<StoreState>) => void) {
  const data = await loadData();
  set({ ...data, ready: true, error: null });
}

export const useAppStore = create<StoreState>((set, get) => ({
  ready: false,
  error: null,
  settings: null,
  categories: [],
  transactions: [],
  budgets: [],
  init: async () => {
    try {
      const data = await initializeStorage();
      set({ ...data, ready: true, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to initialize storage", ready: true });
    }
  },
  setCurrency: async (currency) => {
    const settings = get().settings;
    if (!settings) return;
    await saveSettings({ ...settings, mainCurrency: currency });
    await refresh(set);
  },
  saveTransaction: async (transaction) => {
    await dbUpsertTransaction(transaction);
    await refresh(set);
  },
  deleteTransaction: async (transactionId) => {
    await dbDeleteTransaction(transactionId);
    await refresh(set);
  },
  saveBudget: async (budget) => {
    await dbUpsertBudget(budget);
    await refresh(set);
  },
  removeBudget: async (budgetId) => {
    await dbRemoveBudget(budgetId);
    await refresh(set);
  },
  saveCategory: async (category) => {
    await dbUpsertCategory(category);
    await refresh(set);
  },
  deleteCategory: async (categoryId) => {
    await dbDeleteCategory(categoryId);
    await refresh(set);
  }
}));

export function AppProvider({ children }: { children: ReactNode }) {
  const init = useAppStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  return children;
}
