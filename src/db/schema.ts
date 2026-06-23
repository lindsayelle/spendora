export const schemaSql = `
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  main_currency TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_category_id TEXT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#177E73',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  budget_type TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  day_type TEXT NULL,
  category_id TEXT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  total_spent_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  category_summary_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
