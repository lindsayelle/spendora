import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { z } from "zod";

import { AppButton } from "@/components/AppButton";
import { Chip } from "@/components/Chip";
import { DatePickerField } from "@/components/DatePickerField";
import { TextField } from "@/components/TextField";
import type { Category, CurrencyCode, Transaction } from "@/types";
import { todayISO } from "@/utils/date";
import { isFutureDate } from "@/utils/budget";
import { makeId } from "@/utils/ids";
import { parseMoneyToMinor } from "@/utils/money";
import { palette } from "@/utils/theme";

type FormValues = Omit<Transaction, "createdAt" | "updatedAt"> & Partial<Pick<Transaction, "createdAt" | "updatedAt">>;

type Props = {
  categories: Category[];
  currency: CurrencyCode;
  initial?: Transaction | null;
  buttonLabel?: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel?: () => void;
};

const schema = z.object({
  amountMinor: z.number().positive(),
  categoryId: z.string().min(1),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(120)
});

export function TransactionForm({ categories, currency, initial, buttonLabel = "Save", onSubmit, onCancel }: Props) {
  const colors = palette(useColorScheme());
  const firstCategory = categories[0]?.id ?? "";
  const [amount, setAmount] = useState(initial ? (initial.amountMinor / 100).toFixed(2) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? firstCategory);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.transactionDate ?? todayISO());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categoryId && firstCategory) setCategoryId(firstCategory);
  }, [categoryId, firstCategory]);

  const canSave = useMemo(() => categories.length > 0 && !saving, [categories.length, saving]);

  async function handleSave() {
    const amountMinor = parseMoneyToMinor(amount);
    if (amountMinor === null) {
      setError("Enter a valid amount.");
      return;
    }
    if (isFutureDate(date)) {
      setError("Future dates are not supported in V1.");
      return;
    }
    const parsed = schema.safeParse({ amountMinor, categoryId, transactionDate: date, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the transaction details.");
      return;
    }

    setSaving(true);
    setError("");
    await onSubmit({
      id: initial?.id ?? makeId("txn"),
      amountMinor,
      currency,
      categoryId,
      description: description.trim(),
      transactionDate: date,
      createdAt: initial?.createdAt
    });
    if (!initial) {
      setAmount("");
      setDescription("");
      setDate(todayISO());
    }
    setSaving(false);
  }

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <TextField label="Amount" value={amount} onChangeText={setAmount} placeholder="38.50" keyboardType="decimal-pad" />
        <DatePickerField label="Date" value={date} onChange={setDate} disableFuture />
      </View>
      <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Lunch at cafe" maxLength={120} />
      <View style={styles.categoryBlock}>
        <Text style={[styles.label, { color: colors.muted }]}>Category</Text>
        {categories.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((category) => (
              <Chip key={category.id} label={category.name} selected={category.id === categoryId} onPress={() => setCategoryId(category.id)} />
            ))}
          </ScrollView>
        ) : (
          <Text style={{ color: colors.muted }}>Create a category to start tracking spending.</Text>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      <View style={styles.actions}>
        {onCancel ? <AppButton label="Cancel" variant="secondary" icon="close-outline" onPress={onCancel} /> : null}
        <AppButton label={buttonLabel} icon="save-outline" onPress={handleSave} disabled={!canSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  categoryBlock: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  chips: {
    gap: 8,
    paddingVertical: 2
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap"
  },
  error: {
    fontSize: 14,
    fontWeight: "700"
  }
});
