import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Category, CurrencyCode, Transaction } from "@/types";
import { categoryName, totalForTransactions } from "@/utils/insights";
import { displayDate, displayMonth } from "@/utils/date";
import { formatMoney } from "@/utils/money";

export function categoryBreakdown(transactions: Transaction[], categories: Category[]) {
  const totals = new Map<string, number>();
  transactions.forEach((transaction) => {
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amountMinor);
  });
  return [...totals.entries()]
    .map(([categoryId, value]) => ({ label: categoryName(categories, categoryId), value }))
    .sort((a, b) => b.value - a.value);
}

function reportHtml({
  month,
  currency,
  transactions,
  categories,
  comparison
}: {
  month: string;
  currency: CurrencyCode;
  transactions: Transaction[];
  categories: Category[];
  comparison: string;
}) {
  const breakdown = categoryBreakdown(transactions, categories);
  const rows = transactions
    .map((transaction) => `
      <tr>
        <td>${displayDate(transaction.transactionDate)}</td>
        <td>${categoryName(categories, transaction.categoryId)}</td>
        <td>${transaction.description || ""}</td>
        <td class="amount">${formatMoney(transaction.amountMinor, currency)}</td>
      </tr>
    `)
    .join("");
  const categoryRows = breakdown
    .map((item) => `<tr><td>${item.label}</td><td class="amount">${formatMoney(item.value, currency)}</td></tr>`)
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Spendora ${displayMonth(month)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17202A; padding: 32px; }
          h1 { margin: 0; font-size: 30px; }
          h2 { margin-top: 28px; font-size: 18px; }
          .muted { color: #687382; }
          .summary { margin-top: 20px; padding: 18px; border: 1px solid #DDE2E8; border-radius: 8px; }
          .total { font-size: 28px; font-weight: 800; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { text-align: left; border-bottom: 1px solid #E5E7EB; padding: 10px 6px; font-size: 13px; }
          th { color: #687382; text-transform: uppercase; font-size: 11px; }
          .amount { text-align: right; font-variant-numeric: tabular-nums; }
        </style>
      </head>
      <body>
        <h1>Spendora</h1>
        <div class="muted">Monthly report for ${displayMonth(month)}</div>
        <div class="summary">
          <div class="muted">Total monthly spending</div>
          <div class="total">${formatMoney(totalForTransactions(transactions), currency)}</div>
          <div>${comparison}</div>
        </div>
        <h2>Category breakdown</h2>
        <table><tbody>${categoryRows || "<tr><td>No category spending</td><td></td></tr>"}</tbody></table>
        <h2>Transactions</h2>
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="amount">Amount</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='4'>No transactions for this month yet.</td></tr>"}</tbody>
        </table>
        <p class="muted">Generated ${new Date().toLocaleDateString()}</p>
      </body>
    </html>
  `;
}

export async function exportMonthlyReport(input: {
  month: string;
  currency: CurrencyCode;
  transactions: Transaction[];
  categories: Category[];
  comparison: string;
}) {
  const html = reportHtml(input);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
    win?.focus();
    win?.print();
    return;
  }

  const file = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Spendora ${displayMonth(input.month)}`
    });
  }
}
