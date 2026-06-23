export type CurrencyCode = "CNY" | "JPY" | "USD" | "EUR" | "GBP" | "SGD" | "IDR";

export type Settings = {
  id: string;
  mainCurrency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  amountMinor: number;
  currency: CurrencyCode;
  description: string;
  categoryId: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetType = "daily" | "weekly" | "monthly";
export type DayType = "weekday" | "weekend" | null;

export type Budget = {
  id: string;
  budgetType: BudgetType;
  amountMinor: number;
  currency: CurrencyCode;
  dayType: DayType;
  categoryId: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  settings: Settings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};
