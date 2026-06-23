import type { CurrencyCode } from "@/types";

const currencySymbols: Record<CurrencyCode, string> = {
  CNY: "¥",
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
  IDR: "Rp"
};

export const currencyOptions: CurrencyCode[] = ["CNY", "JPY", "USD", "EUR", "GBP", "SGD", "IDR"];

export function parseMoneyToMinor(input: string): number | null {
  const normalized = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function minorToInput(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

export function formatMoney(amountMinor: number, currency: CurrencyCode) {
  const sign = amountMinor < 0 ? "-" : "";
  const value = Math.abs(amountMinor) / 100;
  return `${sign}${currencySymbols[currency]}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
